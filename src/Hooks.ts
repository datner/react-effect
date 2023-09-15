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
export const make: <R, RE>(
  runtimeContext: RuntimeContext.ReactContext<R, RE>
) => {
  useResult: <R0 extends R, E, A>(
    evaluate: () => Stream.Stream<R0, E, A>,
    deps: DependencyList
  ) => ResultBag.ResultBag<RE | E, A>
  useResultCallback: <Args extends Array<any>, R0 extends R, E, A>(
    f: (...args: Args) => Stream.Stream<R0, E, A>
  ) => readonly [ResultBag.ResultBag<RE | E, A>, (...args: Args) => void]
} = internal.make

/**
 * @since 1.0.0
 * @category constructors
 */
export const makeUseResult: <R, RE>(
  runtimeContext: RuntimeContext.ReactContext<R, RE>
) => <R0 extends R, E, A>(
  evaluate: () => Stream.Stream<R0, E, A>,
  deps: DependencyList
) => ResultBag.ResultBag<RE | E, A> = internal.makeUseResult

/**
 * @since 1.0.0
 * @category constructors
 */
export const makeUseResultCallback: <R, RE>(
  runtimeContext: RuntimeContext.ReactContext<R, RE>
) => <Args extends Array<any>, R0 extends R, E, A>(
  f: (...args: Args) => Stream.Stream<R0, E, A>
) => readonly [ResultBag.ResultBag<RE | E, A>, (...args: Args) => void] = internal.makeUseResultCallback
