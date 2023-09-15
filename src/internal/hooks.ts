import * as Hash from "@effect/data/Hash"
import type * as Stream from "@effect/stream/Stream"
import * as FiberStore from "effect-react/FiberStore"
import type * as ResultBag from "effect-react/ResultBag"
import type * as RuntimeContext from "effect-react/RuntimeContext"
import type { DependencyList } from "react"
import { useCallback, useContext, useRef, useSyncExternalStore } from "react"

/** @internal */
export const make = <R, RE>(
  runtimeContext: RuntimeContext.ReactContext<R, RE>
): {
  useResult: <R0 extends R, E, A>(
    evaluate: () => Stream.Stream<R0, E, A>,
    deps: DependencyList
  ) => ResultBag.ResultBag<RE | E, A>
  useResultCallback: <Args extends Array<any>, R0 extends R, E, A>(
    f: (...args: Args) => Stream.Stream<R0, E, A>
  ) => readonly [ResultBag.ResultBag<RE | E, A>, (...args: Args) => void]
} => ({
  useResult: makeUseResult(runtimeContext),
  useResultCallback: makeUseResultCallback(runtimeContext)
})

/** @internal */
export const makeUseResult = <R, RE>(
  runtimeContext: RuntimeContext.ReactContext<R, RE>
) =>
  <R0 extends R, E, A>(
    evaluate: () => Stream.Stream<R0, E, A>,
    deps: DependencyList
  ): ResultBag.ResultBag<RE | E, A> => {
    const runtime = useContext(runtimeContext)
    const storeRef = useRef<FiberStore.FiberStore<R0, E | RE, A>>(undefined as any)
    if (storeRef.current === undefined) {
      storeRef.current = FiberStore.make<R0, E | RE, A>(runtime)
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

/** @internal */
export const makeUseResultCallback = <R, RE>(
  runtimeContext: RuntimeContext.ReactContext<R, RE>
) =>
  <Args extends Array<any>, R0 extends R, E, A>(
    f: (...args: Args) => Stream.Stream<R0, E, A>
  ): readonly [ResultBag.ResultBag<RE | E, A>, (...args: Args) => void] => {
    const runtime = useContext(runtimeContext)
    const storeRef = useRef<FiberStore.FiberStore<R0, RE | E, A>>(undefined as any)
    if (storeRef.current === undefined) {
      storeRef.current = FiberStore.make<R0, RE | E, A>(runtime)
    }
    const resultBag = useSyncExternalStore(
      storeRef.current.subscribe,
      storeRef.current.snapshot
    )
    const run = useCallback((...args: Args) => {
      storeRef.current.run(f(...args))
    }, [f])
    return [resultBag, run] as const
  }
