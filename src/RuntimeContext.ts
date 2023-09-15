/**
 * @since 1.0.0
 */
import type * as Context from "@effect/data/Context"
import { dual, pipe } from "@effect/data/Function"
import * as Effect from "@effect/io/Effect"
import * as Exit from "@effect/io/Exit"
import * as Fiber from "@effect/io/Fiber"
import * as Layer from "@effect/io/Layer"
import * as Runtime from "@effect/io/Runtime"
import * as Scope from "@effect/io/Scope"
import * as React from "react"

/**
 * @since 1.0.0
 * @category type ids
 */
export const RuntimeContextTypeId = Symbol.for("@effect/react/RuntimeContext")

/**
 * @since 1.0.0
 * @category type ids
 */
export type RuntimeContextTypeId = typeof RuntimeContextTypeId

/**
 * @since 1.0.0
 * @category models
 */
export interface RuntimeContext<R, E> extends ReactContext<R, E> {
  readonly [RuntimeContextTypeId]: {
    readonly scope: Scope.CloseableScope
    readonly context: Effect.Effect<never, E, Context.Context<R>>
  }
}

/**
 * @since 1.0.0
 * @category models
 */
export type ReactContext<R, E> = React.Context<Effect.Effect<never, E, Runtime.Runtime<R>>>

/**
 * @since 1.0.0
 * @category models
 */
export type RuntimeEffect<R, E> = Effect.Effect<never, E, Runtime.Runtime<R>>

/**
 * @since 1.0.0
 * @category constructors
 */
export const fromContext = <R>(
  context: Context.Context<R>
): RuntimeContext<R, never> => fromContextEffect(Effect.succeed(context))

/**
 * @since 1.0.0
 * @category constructors
 */
export const fromContextEffect = <R, E>(
  effect: Effect.Effect<Scope.Scope, E, Context.Context<R>>
): RuntimeContext<R, E> => {
  const scope = Effect.runSync(Scope.make())
  const context = Scope.use(effect, scope)
  const runtime = pipe(
    context,
    Effect.flatMap((context) => Effect.provideContext(Effect.runtime<R>(), context)),
    Effect.cached,
    Effect.runSync
  )
  // populate the cache
  Effect.runFork(runtime)

  const RuntimeContext = React.createContext(runtime)
  return {
    ...RuntimeContext,
    [RuntimeContextTypeId]: {
      scope,
      context
    }
  }
}

/**
 * @since 1.0.0
 * @category constructors
 */
export const fromLayer = <R, E>(layer: Layer.Layer<never, E, R>): RuntimeContext<R, E> =>
  fromContextEffect(Effect.runSync(Effect.cached(Layer.build(layer))))

/**
 * @since 1.0.0
 * @category combinators
 */
export const provideMerge = dual<
  <R, RX extends R, R2, E2>(
    layer: Layer.Layer<RX, E2, R2>
  ) => <E>(self: RuntimeContext<R, E>) => RuntimeContext<R | R2, E | E2>,
  <R, E, RX extends R, R2, E2>(
    self: RuntimeContext<R, E>,
    layer: Layer.Layer<RX, E2, R2>
  ) => RuntimeContext<R | R2, E | E2>
>(2, (self, layer) => {
  const context = self[RuntimeContextTypeId].context
  return fromLayer(Layer.provideMerge(Layer.effectContext(context), layer))
})

/**
 * @since 1.0.0
 * @category combinators
 */
export const closeEffect = <R, E>(self: RuntimeContext<R, E>): Effect.Effect<never, never, void> =>
  Scope.close(self[RuntimeContextTypeId].scope, Exit.unit)

/**
 * @since 1.0.0
 * @category combinators
 */
export const close = <R, E>(self: RuntimeContext<R, E>): () => void => {
  const effect = closeEffect(self)
  return () => {
    Effect.runFork(effect)
  }
}

/**
 * @since 1.0.0
 * @category combinators
 */
export const runForkJoin = <R, RE>(
  runtime: RuntimeEffect<R, RE>
) =>
  <RX extends R, E, A>(effect: Effect.Effect<RX, E, A>): Effect.Effect<never, RE | E, A> =>
    Effect.flatMap(
      runtime,
      (runtime) => {
        const fiber = Runtime.runFork(runtime)(effect)
        return Fiber.join(fiber)
      }
    )
