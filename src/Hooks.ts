/**
 * @since 1.0.0
 */
import type * as Stream from "@effect/stream/Stream"
import * as internal from "effect-react/internal/hooks"
import type * as ResultBag from "effect-react/ResultBag"
import type * as RuntimeContext from "effect-react/RuntimeContext"
import type { DependencyList } from "react"

/**
 * @since 1.0.0
 * @category constructors
 */
export const make: <R>(
  runtimeContext: RuntimeContext.ReactContext<R>
) => {
  useResult: <R0 extends R, E, A>(
    evaluate: () => Stream.Stream<R0, E, A>,
    deps: DependencyList
  ) => ResultBag.ResultBag<unknown, A>
  useResultCallback: <Args extends Array<any>, R0 extends R, E, A>(
    f: (...args: Args) => Stream.Stream<R0, E, A>
  ) => readonly [ResultBag.ResultBag<unknown, A>, (...args: Args) => void]
} = internal.make

/**
 * @since 1.0.0
 * @category constructors
 */
export const makeUseResult: <R>(
  runtimeContext: RuntimeContext.ReactContext<R>
) => <R0 extends R, E, A>(evaluate: () => Stream.Stream<R0, E, A>, deps: DependencyList) => ResultBag.ResultBag<E, A> =
  internal.makeUseResult

/**
 * @since 1.0.0
 * @category constructors
 */
export const makeUseResultCallback: <R>(
  runtimeContext: RuntimeContext.ReactContext<R>
) => <Args extends Array<any>, R0 extends R, E, A>(
  f: (...args: Args) => Stream.Stream<R0, E, A>
) => readonly [ResultBag.ResultBag<E, A>, (...args: Args) => void] = internal.makeUseResultCallback
