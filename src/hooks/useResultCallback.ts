import * as Effect from "@effect/io/Effect"
import * as Exit from "@effect/io/Exit"
import * as Fiber from "@effect/io/Fiber"
import * as Ref from "@effect/io/Ref"
import * as Runtime from "@effect/io/Runtime"
import * as Stream from "@effect/stream/Stream"
import type { ResultBag } from "effect-react/hooks/useResultBag"
import { updateNext, useResultBag } from "effect-react/hooks/useResultBag"
import type { RuntimeContext } from "effect-react/internal/runtimeContext"
import * as Result from "effect-react/Result"
import { useCallback, useContext, useEffect, useState } from "react"

type FiberState<E> = { readonly _tag: "Idle" } | {
  readonly _tag: "Running"
  readonly fiber: Fiber.RuntimeFiber<E, void>
  readonly interruptingRef: Ref.Ref<boolean>
}

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

    const [fiberState, setFiberState] = useState<FiberState<E>>({ _tag: "Idle" })
    useEffect(() =>
      () => {
        if (fiberState._tag === "Running") {
          Effect.runFork(Fiber.interruptFork(fiberState.fiber))
        }
      }, [])

    const runtime = useContext(runtimeContext)
    const run = useCallback((...args: Args) => {
      if (fiberState._tag === "Running") {
        Effect.runSync(Ref.set(fiberState.interruptingRef, true))
        Effect.runFork(Fiber.interruptFork(fiberState.fiber))
      }

      trackRef.current.invocationCount++

      const interruptingRef = Ref.unsafeMake(false)
      const maybeSetResult = (result: Result.Result<E, A> | ((_: Result.Result<E, A>) => Result.Result<E, A>)) =>
        Effect.flatMap(
          Ref.get(interruptingRef),
          (interrupting) =>
            interrupting ? Effect.unit : Effect.sync(() => {
              setResult(result)
            })
        )

      const fiber = Stream.suspend(() => {
        setResult((prev) => updateNext(Result.waiting(prev), trackRef))
        return f(...args)
      }).pipe(
        Stream.tap((value) => maybeSetResult(updateNext(Result.success(value), trackRef))),
        Stream.tapErrorCause((cause) => maybeSetResult(updateNext(Result.failCause(cause), trackRef))),
        Stream.runDrain,
        Effect.onExit((exit) =>
          Exit.isInterrupted(exit)
            ? Effect.unit
            : Effect.sync(() => setFiberState({ _tag: "Idle" }))
        ),
        Runtime.runFork(runtime)
      )

      setFiberState({
        _tag: "Running",
        fiber,
        interruptingRef
      })
    }, [f, fiberState])

    return [resultBag, run] as const
  }
