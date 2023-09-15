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
export interface RuntimeContext<R> extends ReactContext<R> {
  readonly [RuntimeContextTypeId]: {
    readonly scope: Scope.CloseableScope
    readonly context: Effect.Effect<never, never, Context.Context<R>>
  }
}

/**
 * @since 1.0.0
 * @category models
 */
export type ReactContext<R> = React.Context<Effect.Effect<never, never, Runtime.Runtime<R>>>

/**
 * @since 1.0.0
 * @category models
 */
export type RuntimeEffect<R> = Effect.Effect<never, never, Runtime.Runtime<R>>

/**
 * @since 1.0.0
 * @category constructors
 */
export const fromContext = <R>(
  context: Context.Context<R>
): RuntimeContext<R> => fromContextEffect(Effect.succeed(context))

const makeRuntimeEffect = <R>(context: Effect.Effect<never, never, Context.Context<R>>): RuntimeEffect<R> => {
  const runtime = pipe(
    context,
    Effect.flatMap((context) => Effect.provideContext(Effect.runtime<R>(), context)),
    Effect.cached,
    Effect.runSync
  )
  Effect.runFork(runtime) // prime cache
  return runtime
}

/**
 * @since 1.0.0
 * @category constructors
 */
export const fromContextEffect = <R, E>(
  effect: Effect.Effect<Scope.Scope, E, Context.Context<R>>
): RuntimeContext<R> => {
  const scope = Effect.runSync(Scope.make())
  const error = new Error()
  const context = Scope.use(
    Effect.orDieWith(effect, (e) => {
      error.message = `Could not build RuntimeContext: ${e}`
      return error
    }),
    scope
  )
  const runtime = makeRuntimeEffect(context)
  const RuntimeContext = React.createContext(runtime)
  return new Proxy(RuntimeContext, {
    has(target, p) {
      return p === RuntimeContextTypeId || p in target
    },
    get(target, p, _receiver) {
      if (p === RuntimeContextTypeId) {
        return {
          scope,
          context
        }
      }
      return (target as any)[p]
    }
  }) as any
}

/**
 * @since 1.0.0
 * @category constructors
 */
export const fromLayer = <R, E>(layer: Layer.Layer<never, E, R>): RuntimeContext<R> =>
  fromContextEffect(Effect.runSync(Effect.cached(Layer.build(layer))))

/**
 * @since 1.0.0
 * @category combinators
 */
export const provideMerge = dual<
  <R, RX extends R, R2, E>(
    layer: Layer.Layer<RX, E, R2>
  ) => (self: RuntimeContext<R>) => RuntimeContext<R | R2>,
  <R, RX extends R, R2, E>(
    self: RuntimeContext<R>,
    layer: Layer.Layer<RX, E, R2>
  ) => RuntimeContext<R | R2>
>(2, (self, layer) => {
  const context = self[RuntimeContextTypeId].context
  return fromLayer(Layer.provideMerge(Layer.effectContext(context), layer))
})

/**
 * @since 1.0.0
 * @category combinators
 */
export const toRuntimeEffect = <R>(
  self: RuntimeContext<R>
): RuntimeEffect<R> => makeRuntimeEffect(self[RuntimeContextTypeId].context)

/**
 * @since 1.0.0
 * @category combinators
 */
export const overrideLayer = dual<
  <R, RX extends R, E>(
    layer: Layer.Layer<never, E, RX>
  ) => (self: RuntimeContext<R>) => readonly [React.ExoticComponent<React.PropsWithChildren>, Scope.CloseableScope],
  <R, E>(
    self: RuntimeContext<R>,
    layer: Layer.Layer<never, E, R>
  ) => readonly [React.ExoticComponent<React.PropsWithChildren>, Scope.CloseableScope]
>(2, (self, layer) => {
  const context = fromLayer(layer)
  const runtime = toRuntimeEffect(context)
  return [
    (props: React.PropsWithChildren) => React.createElement(self.Provider, { value: runtime }, props.children),
    context[RuntimeContextTypeId].scope
  ] as any
})

/**
 * @since 1.0.0
 * @category combinators
 */
export const closeEffect = <R>(self: RuntimeContext<R>): Effect.Effect<never, never, void> =>
  Scope.close(self[RuntimeContextTypeId].scope, Exit.unit)

/**
 * @since 1.0.0
 * @category combinators
 */
export const close = <R>(self: RuntimeContext<R>): () => void => {
  const effect = closeEffect(self)
  return () => {
    Effect.runFork(effect)
  }
}

/**
 * @since 1.0.0
 * @category execution
 */
export const runForkJoin = <R>(
  runtime: RuntimeEffect<R>
) =>
  <RX extends R, E, A>(effect: Effect.Effect<RX, E, A>): Effect.Effect<never, E, A> =>
    Effect.flatMap(
      runtime,
      (runtime) => {
        const fiber = Runtime.runFork(runtime)(effect)
        return Fiber.join(fiber)
      }
    )
