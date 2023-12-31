import type * as Runtime from "@effect/io/Runtime"
import type * as Stream from "@effect/stream/Stream"
import * as internal from "effect-react/internal/fiberStore"
import type * as ResultBag from "effect-react/ResultBag"

/**
 * @since 1.0.0
 * @category models
 */
export interface FiberStore<R, E, A> {
  readonly snapshot: () => ResultBag.ResultBag<E, A>
  readonly run: (stream: Stream.Stream<R, E, A>) => void
  readonly subscribe: (listener: () => void) => () => void
  readonly interruptIfRunning: () => void
}

/**
 * @since 1.0.0
 * @category constructors
 */
export const make: <R, E, A>(runtime: Runtime.Runtime<R>) => FiberStore<R, E, A> = internal.make
