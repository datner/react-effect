"use client"
import { pipe } from "@effect/data/Function"
import * as Option from "@effect/data/Option"
import * as Effect from "@effect/io/Effect"
import * as Layer from "@effect/io/Layer"
import * as LogLevel from "@effect/io/Logger/Level"
import type * as Runtime from "@effect/io/Runtime"
import * as Scope from "@effect/io/Scope"
import { createContext } from "react"
import type { UseEffectCallback } from "react-effect/hooks/useEffectCallback"
import { makeUseEffectCallback } from "react-effect/hooks/useEffectCallback"
import type { UseEffectResult } from "react-effect/hooks/useEffectResult"
import { makeUseEffectResult } from "react-effect/hooks/useEffectResult"

export { RuntimeContext } from "react-effect/internal/runtimeContext"

export interface ReactEffectBag<R, D> {
  readonly RuntimeContext: React.Context<Effect.Effect<never, D, Runtime.Runtime<R>>>
  readonly useEffectCallback: UseEffectCallback<R, D>
  readonly useEffectResult: UseEffectResult<R, D>
}

export const makeFromLayer = <R, E>(
  layer: Layer.Layer<never, E, R>
): ReactEffectBag<R, E> => {
  const scope = Effect.runSync(Scope.make())

  const runtime = pipe(
    Layer.toRuntime(layer),
    Effect.provideService(Scope.Scope, scope),
    Effect.withUnhandledErrorLogLevel(Option.some(LogLevel.Fatal)),
    Effect.cached,
    Effect.runSync
  )

  const RuntimeContext = createContext(runtime)

  return {
    RuntimeContext,
    useEffectCallback: makeUseEffectCallback(RuntimeContext),
    useEffectResult: makeUseEffectResult(RuntimeContext)
  }
}
