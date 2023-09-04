import * as Effect from "@effect/io/Effect"
import * as Fiber from "@effect/io/Fiber"
import * as Runtime from "@effect/io/Runtime"
import type * as Schedule from "@effect/io/Schedule"
import * as Stream from "@effect/stream/Stream"
import { useContext, useRef, useState } from "react"
import type { ResultBag } from "react-effect/hooks/useResultBag"
import { updateNext, useResultBag } from "react-effect/hooks/useResultBag"
import type { RuntimeContext } from "react-effect/internal/runtimeContext"
import * as Result from "react-effect/Result"

export type UseResult<R> = <R0 extends R, E, A>(
  effect: Effect.Effect<R0, E, A>
) => ResultBag<E, A>

export const makeUseResult: <R>(
  runtimeContext: RuntimeContext<R>
) => UseResult<R> = <R>(runtimeContext: RuntimeContext<R>) =>
  <R0 extends R, E, A>(stream: Stream.Stream<R0, E, A>) => {
    const runtime = useContext(runtimeContext)
    const prevRef = useRef<Stream.Stream<R0, E, A>>()
    const fiberRef = useRef<Fiber.RuntimeFiber<E, void>>()
    const [result, setResult] = useState<Result.Result<E, A>>(Result.waiting(Result.initial()))
    const [trackRef, resultBag] = useResultBag(result)

    if (prevRef.current !== stream) {
      prevRef.current = stream
      if (fiberRef.current) {
        Effect.runSync(Fiber.interruptFork(fiberRef.current))
      }
      fiberRef.current = stream.pipe(
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

    return resultBag
  }
