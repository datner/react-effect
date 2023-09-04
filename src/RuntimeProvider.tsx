"use client"
import { pipe } from "@effect/data/Function"
import * as Effect from "@effect/io/Effect"
import * as Layer from "@effect/io/Layer"
import type * as Runtime from "@effect/io/Runtime"
import * as Scope from "@effect/io/Scope"
import { createContext } from "react"
import type { UseResult } from "react-effect/hooks/useResult"
import { makeUseResult } from "react-effect/hooks/useResult"
import type { UseResultCallback } from "react-effect/hooks/useResultCallback"
import { makeUseResultCallback } from "react-effect/hooks/useResultCallback"

export { RuntimeContext } from "react-effect/internal/runtimeContext"

export interface ReactEffectBag<R> {
  readonly RuntimeContext: React.Context<Runtime.Runtime<R>>
  readonly useResultCallback: UseResultCallback<R>
  readonly useResult: UseResult<R>
}

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
    useResultCallback: makeUseResultCallback(RuntimeContext),
    useResult: makeUseResult(RuntimeContext)
  }
}
