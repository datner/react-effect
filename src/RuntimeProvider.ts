"use client"
import type { LazyArg } from "@effect/data/Function"
import { pipe } from "@effect/data/Function"
import * as Effect from "@effect/io/Effect"
import * as Layer from "@effect/io/Layer"
import type * as Runtime from "@effect/io/Runtime"
import * as Scope from "@effect/io/Scope"
import type * as Stream from "@effect/stream/Stream"
import * as internalUseResult from "effect-react/internal/hooks/useResult"
import * as internalUseResultCallback from "effect-react/internal/hooks/useResultCallback"
import type * as ResultBag from "effect-react/ResultBag"
import type { DependencyList } from "react"
import { createContext } from "react"

/**
 * @since 1.0.0
 * @category models
 */
export type RuntimeContext<R> = React.Context<Runtime.Runtime<R>>

/**
 * @since 1.0.0
 * @category hooks
 */
export type UseResult<R> = <R0 extends R, E, A>(
  evaluate: LazyArg<Stream.Stream<R0, E, A>>,
  deps: DependencyList
) => ResultBag.ResultBag<E, A>

/**
 * @since 1.0.0
 * @category hooks
 */
export type UseResultCallback<R> = <Args extends Array<any>, R0 extends R, E, A>(
  f: (...args: Args) => Stream.Stream<R0, E, A>
) => readonly [ResultBag.ResultBag<E, A>, (...args: Args) => void]

/**
 * @since 1.0.0
 * @category models
 */
export interface ReactEffectBag<R> {
  readonly RuntimeContext: React.Context<Runtime.Runtime<R>>
  readonly useResultCallback: UseResultCallback<R>
  readonly useResult: UseResult<R>
}

/**
 * @since 1.0.0
 * @category constructors
 */
export const makeFromLayer = <R, E>(
  layer: Layer.Layer<never, E, R>
): ReactEffectBag<R> => {
  const scope = Effect.runSync(Scope.make())

  const runtime = pipe(
    Layer.toRuntime(layer),
    Effect.provideService(Scope.Scope, scope),
    Effect.runSync
  )

  const RuntimeContext = createContext(runtime)

  return {
    RuntimeContext,
    useResultCallback: internalUseResultCallback.make(RuntimeContext),
    useResult: internalUseResult.make(RuntimeContext)
  }
}

/**
 * @since 1.0.0
 * @category constructors
 */
export const makeFromRuntime = <R>(
  runtime: Runtime.Runtime<R>
): ReactEffectBag<R> => {
  const RuntimeContext = createContext(runtime)

  return {
    RuntimeContext,
    useResultCallback: internalUseResultCallback.make(RuntimeContext),
    useResult: internalUseResult.make(RuntimeContext)
  }
}

/**
 * @since 1.0.0
 * @category constructors
 */
export const makeFromRuntimeContext = <R>(
  RuntimeContext: React.Context<Runtime.Runtime<R>>
): ReactEffectBag<R> => {
  return {
    RuntimeContext,
    useResultCallback: internalUseResultCallback.make(RuntimeContext),
    useResult: internalUseResult.make(RuntimeContext)
  }
}
