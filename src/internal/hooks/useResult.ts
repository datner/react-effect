import * as Hash from "@effect/data/Hash"
import type * as Stream from "@effect/stream/Stream"
import * as FiberStore from "effect-react/FiberStore"
import type * as ResultBag from "effect-react/ResultBag"
import type * as RuntimeProvider from "effect-react/RuntimeProvider"
import type { DependencyList } from "react"
import { useContext, useRef, useSyncExternalStore } from "react"

export const make = <R>(
  runtimeContext: RuntimeProvider.RuntimeContext<R>
): RuntimeProvider.UseResult<R> =>
  <R0 extends R, E, A>(
    evaluate: () => Stream.Stream<R0, E, A>,
    deps: DependencyList
  ): ResultBag.ResultBag<E, A> => {
    const runtime = useContext(runtimeContext)
    const storeRef = useRef<FiberStore.FiberStore<R0, E, A>>(undefined as any)
    if (storeRef.current === undefined) {
      storeRef.current = FiberStore.make(runtime)
    }
    const resultBag = useSyncExternalStore(
      storeRef.current.subscribe,
      storeRef.current.snapshot
    )
    const depsHash = useRef<number>(null as any)
    const currentDepsHash = Hash.array(deps)
    if (depsHash.current !== currentDepsHash) {
      depsHash.current = currentDepsHash
      storeRef.current.run(evaluate())
    }
    return resultBag
  }
