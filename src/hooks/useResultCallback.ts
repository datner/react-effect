import * as Option from "@effect/data/Option"
import * as Effect from "@effect/io/Effect"
import * as Fiber from "@effect/io/Fiber"
import * as Runtime from "@effect/io/Runtime"
import * as Stream from "@effect/stream/Stream"
import type { ResultBag } from "effect-react/hooks/useResultBag"
import { updateNext, useResultBag } from "effect-react/hooks/useResultBag"
import type { RuntimeContext } from "effect-react/internal/runtimeContext"
import * as Result from "effect-react/Result"
import { useCallback, useContext, useEffect, useState } from "react"

export type UseResultCallback<R> = <Args extends Array<any>, R0 extends R, E, A>(
  callback: (...args: Args) => Effect.Effect<R0, E, A>
) => readonly [ResultBag<E, A>, (...args: Args) => void]

export const makeUseResultCallback: <R>(
  runtimeContext: RuntimeContext<R>
) => UseResultCallback<R> = <R>(
  runtimeContext: RuntimeContext<R>
) =>
  <Args extends Array<any>, R0 extends R, E, A>(
    f: (...args: Args) => Stream.Stream<R0, E, A>
  ) => {
    const [result, setResult] = useState<Result.Result<E, A>>(Result.initial())
    const [trackRef, resultBag] = useResultBag(result)
    trackRef.current.currentStatus = result._tag

    const runtime = useContext(runtimeContext)
    const [currentArgs, setCurrentArgs] = useState<Option.Option<Args>>(Option.none())
    useEffect(() => {
      if (Option.isNone(currentArgs)) {
        return
      }

      let interrupting = false
      const maybeSetResult = (result: Result.Result<E, A> | ((_: Result.Result<E, A>) => Result.Result<E, A>)) =>
        Effect.sync(() => {
          if (!interrupting) {
            setResult(result)
          }
        })

      const fiber = Stream.suspend(() => {
        setResult((prev) => updateNext(Result.waiting(prev), trackRef))
        return f(...currentArgs.value)
      }).pipe(
        Stream.tap((value) => maybeSetResult(updateNext(Result.success(value), trackRef))),
        Stream.tapErrorCause((cause) => maybeSetResult(updateNext(Result.failCause(cause), trackRef))),
        Stream.runDrain,
        Runtime.runFork(runtime)
      )

      return () => {
        interrupting = true
        Effect.runFork(Fiber.interruptFork(fiber))
      }
    }, [currentArgs])

    const run = useCallback((...args: Args) => {
      setCurrentArgs(Option.some(args))
    }, [])

    return [resultBag, run] as const
  }
