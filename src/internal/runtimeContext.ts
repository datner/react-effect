import type * as Runtime from "@effect/io/Runtime"

/* @internal */
export type RuntimeContext<R> = React.Context<Runtime.Runtime<R>>
