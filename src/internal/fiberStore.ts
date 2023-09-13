import { pipe } from "@effect/data/Function"
import * as Effect from "@effect/io/Effect"
import type * as Fiber from "@effect/io/Fiber"
import * as Ref from "@effect/io/Ref"
import * as Runtime from "@effect/io/Runtime"
import * as Stream from "@effect/stream/Stream"
import type * as FiberStore from "effect-react/FiberStore"
import * as Result from "effect-react/Result"
import * as ResultBag from "effect-react/ResultBag"
import * as TrackedProperties from "effect-react/TrackedProperties"

/** @internal */
export const make = <R, E, A>(
  runtime: Runtime.Runtime<R>
): FiberStore.FiberStore<R, E, A> => new FiberStoreImpl(runtime)

class FiberStoreImpl<R, E, A> implements FiberStore.FiberStore<R, E, A> {
  constructor(
    readonly runtime: Runtime.Runtime<R>
  ) {}

  private listeners: Array<() => void> = []

  public subscribe = (listener: () => void) => {
    this.listeners.push(listener)

    if (!this.fiberState && this.stream) {
      this.run(this.stream)
    }

    return () => {
      this.listeners.splice(this.listeners.indexOf(listener), 1)

      queueMicrotask(() => {
        if (this.listeners.length === 0) {
          this.interruptIfRunning()
        }
      })
    }
  }

  private trackedProps = TrackedProperties.initial()
  private resultBag: ResultBag.ResultBag<E, A> = ResultBag.make(Result.initial(), this.trackedProps)
  private setResult(result: Result.Result<E, A>) {
    TrackedProperties.updateFromResult(this.trackedProps, result)
    this.resultBag = ResultBag.make(result, this.trackedProps)
    for (let i = 0; i < this.listeners.length; i++) {
      this.listeners[i]()
    }
  }
  public snapshot = () => {
    return this.resultBag
  }

  private stream: Stream.Stream<R, E, A> | undefined = undefined
  private fiberState:
    | {
      readonly fiber: Fiber.RuntimeFiber<never, void>
      readonly interruptedRef: Ref.Ref<boolean>
    }
    | undefined = undefined

  public run(stream: Stream.Stream<R, E, A>) {
    this.stream = stream
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
      Stream.suspend(() => {
        this.setResult(Result.waiting(this.resultBag.result))
        return stream
      }),
      Stream.runForEach((_) => maybeSetResult(Result.success(_))),
      Effect.catchAllCause((cause) => maybeSetResult(Result.failCause(cause))),
      Runtime.runFork(this.runtime)
    )

    this.fiberState = {
      fiber,
      interruptedRef
    }
  }

  public interruptIfRunning() {
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
}
