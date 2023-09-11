import { pipe } from "@effect/data/Function"
import * as Effect from "@effect/io/Effect"
import type * as Fiber from "@effect/io/Fiber"
import * as Ref from "@effect/io/Ref"
import * as Runtime from "@effect/io/Runtime"
import * as Stream from "@effect/stream/Stream"
import type { ResultBag } from "effect-react/hooks/useResultBag"
import { initialTrackedProps, makeResultBag, updateTrackedProps } from "effect-react/hooks/useResultBag"
import type { RuntimeContext } from "effect-react/internal/runtimeContext"
import * as Result from "effect-react/Result"
import { useCallback, useContext, useRef, useSyncExternalStore } from "react"

class FiberStore<R, E, A> {
  constructor(
    readonly runtime: Runtime.Runtime<R>
  ) {}

  listeners: Array<() => void> = []

  subscribe = (listener: () => void) => {
    this.listeners.push(listener)

    return () => {
      this.listeners.splice(this.listeners.indexOf(listener), 1)

      queueMicrotask(() => {
        if (this.listeners.length === 0) {
          this.interruptIfRunning()
        }
      })
    }
  }

  result: Result.Result<E, A> = Result.initial()
  trackedProps = initialTrackedProps()
  resultBag = makeResultBag(this.result, this.trackedProps)

  setResult(result: Result.Result<E, A>) {
    this.result = result
    updateTrackedProps(result, this.trackedProps)
    this.resultBag = makeResultBag(result, this.trackedProps)

    for (let i = 0; i < this.listeners.length; i++) {
      this.listeners[i]()
    }
  }
  snapshot = () => {
    return this.resultBag
  }

  fiberState:
    | {
      readonly fiber: Fiber.RuntimeFiber<never, void>
      readonly interruptedRef: Ref.Ref<boolean>
    }
    | undefined = undefined

  interruptIfRunning() {
    if (this.fiberState) {
      Effect.runFork(
        Effect.zipRight(
          Ref.set(this.fiberState.interruptedRef, true),
          this.fiberState.fiber.interruptAsFork(this.fiberState.fiber.id())
        )
      )
      this.fiberState = undefined
    }
  }

  run(stream: Stream.Stream<R, E, A>) {
    this.interruptIfRunning()

    const interruptedRef = Ref.unsafeMake(false)
    const maybeSetResult = (result: Result.Result<E, A>) =>
      Effect.flatMap(
        Ref.get(interruptedRef),
        (interrupted) =>
          interrupted
            ? Effect.unit
            : Effect.sync(() => this.setResult(result))
      )

    const fiber = pipe(
      Stream.runForEach(
        Stream.suspend(() => {
          this.setResult(Result.waiting(this.result))
          return stream
        }),
        (_) => maybeSetResult(Result.success(_))
      ),
      Effect.catchAllCause((cause) => maybeSetResult(Result.failCause(cause))),
      Runtime.runFork(this.runtime)
    )

    this.fiberState = {
      fiber,
      interruptedRef
    }
  }
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
    const runtime = useContext(runtimeContext)
    const storeRef = useRef<FiberStore<R0, E, A>>(undefined as any)
    if (storeRef.current === undefined) {
      storeRef.current = new FiberStore(runtime)
    }
    const resultBag = useSyncExternalStore(
      storeRef.current.subscribe,
      storeRef.current.snapshot
    )
    const run = useCallback((...args: Args) => {
      storeRef.current.run(f(...args))
    }, [f])
    return [resultBag, run] as const
  }
