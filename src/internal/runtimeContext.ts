import type * as Effect from "@effect/io/Effect"
import type * as Runtime from "@effect/io/Runtime"

/* @internal */
export type RuntimeContext<R, E> = React.Context<
  Effect.Effect<never, E, Runtime.Runtime<R>>
>
