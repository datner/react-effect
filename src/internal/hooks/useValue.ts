import * as Option from "@effect/data/Option"
import type * as Stream from "@effect/stream/Stream"
import * as internalUseResult from "effect-react/internal/hooks/useResult"
import * as Result from "effect-react/Result"
import type * as RuntimeProvider from "effect-react/RuntimeProvider"
import { type DependencyList, useRef } from "react"

export const make: <R>(
  runtimeContext: RuntimeProvider.RuntimeContext<R>
) => RuntimeProvider.UseValue<R> = <R>(runtimeContext: RuntimeProvider.RuntimeContext<R>) => {
  const useResult = internalUseResult.make(runtimeContext)
  return <R0 extends R, A>(stream: Stream.Stream<R0, never, A>, initial: A, deps: DependencyList) => {
    const { result } = useResult(() => stream, deps)
    const initialRef = useRef(initial)

    return Option.getOrElse(Result.getValue(result), () => initialRef.current)
  }
}
