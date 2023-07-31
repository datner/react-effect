import * as Effect from "@effect/io/Effect"
import { useCallback, useContext } from "react"
import type { RuntimeContext } from "react-effect/internal/runtimeContext"

export const useStitch = <R, E>(context: RuntimeContext<R, E>) => {
  const runtime = useContext(context)

  return useCallback(
    <R2 extends R, E2, A>(self: Effect.Effect<R2, E2, A>) =>
      runtime.pipe(
        Effect.map((_) => Effect.provideSomeRuntime(_)),
        Effect.flatMap((_) => _(self))
      ),
    [runtime]
  )
}
