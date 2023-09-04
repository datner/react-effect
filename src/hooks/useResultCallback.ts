import * as Effect from "@effect/io/Effect"
import * as Fiber from "@effect/io/Fiber"
import * as Queue from "@effect/io/Queue"
import * as Runtime from "@effect/io/Runtime"
import * as Stream from "@effect/stream/Stream"
import type { ResultBag } from "effect-react/hooks/useResultBag"
import { updateNext, useResultBag } from "effect-react/hooks/useResultBag"
import type { RuntimeContext } from "effect-react/internal/runtimeContext"
import * as Result from "effect-react/Result"
import { useCallback, useContext, useRef, useState } from "react"

export type UseResultCallback<R> = <Args extends Array<any>, R0 extends R, E, A>(
  callback: (...args: Args) => Effect.Effect<R0, E, A>
) => readonly [ResultBag<E, A>, (...args: Args) => void, Queue.Queue<Args>]

export const makeUseResultCallback: <R>(
  runtimeContext: RuntimeContext<R>
) => UseResultCallback<R> = <R>(
  runtimeContext: RuntimeContext<R>
) =>
  <Args extends Array<any>, R0 extends R, E, A>(f: (...args: Args) => Stream.Stream<R0, E, A>) => {
    const runtime = useContext(runtimeContext)
    const fiberRef = useRef<Fiber.RuntimeFiber<E, void>>()
    const prevRef = useRef<typeof f>()
    const queueRef = useRef<Queue.Queue<Args>>()
    if (!queueRef.current) {
      queueRef.current = Effect.runSync(Queue.unbounded())
    }
    const [result, setResult] = useState<Result.Result<E, A>>(Result.initial())
    const [trackRef, resultBag] = useResultBag(result)

    if (prevRef.current !== f) {
      prevRef.current = f
      if (fiberRef.current) {
        Effect.runSync(Fiber.interruptFork(fiberRef.current))
      }
      fiberRef.current = Stream.fromQueue(queueRef.current).pipe(
        Stream.tap(() =>
          Effect.sync(() => {
            setResult((prev) => updateNext(Result.waiting(prev), trackRef))
          })
        ),
        Stream.flatMap((args) => f(...args)),
        Stream.tap((value) =>
          Effect.sync(() => {
            setResult(updateNext(Result.success(value), trackRef))
          })
        ),
        Stream.tapErrorCause((cause) =>
          Effect.sync(() => {
            setResult(updateNext(Result.failCause(cause), trackRef))
          })
        ),
        Stream.runDrain,
        Runtime.runFork(runtime)
      )
    }
    trackRef.current.currentStatus = result._tag

    const run = useCallback((...args: Args) => {
      trackRef.current.invocationCount++
      queueRef.current!.unsafeOffer(args)
    }, [])

    return [resultBag, run, queueRef.current!] as const
  }
