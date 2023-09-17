import * as Context from "@effect/data/Context"
import type * as RuntimeProvider from "effect-react/RuntimeProvider"
import { useContext, useRef } from "react"

export const make: <R>(
  runtimeContext: RuntimeProvider.RuntimeContext<R>
) => RuntimeProvider.UseService<R> = <R>(runtimeContext: RuntimeProvider.RuntimeContext<R>) => {
  return <Tag extends Context.ValidTagsById<R>>(tag: Tag) => {
    const runtime = useContext(runtimeContext)
    const serviceRef = useRef(Context.get(runtime.context, tag))

    return serviceRef.current
  }
}
