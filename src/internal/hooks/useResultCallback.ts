import type * as Stream from "@effect/stream/Stream"
import * as FiberStore from "effect-react/FiberStore"
import type * as ResultBag from "effect-react/ResultBag"
import type * as RuntimeProvider from "effect-react/RuntimeProvider"
import { useCallback, useContext, useRef, useSyncExternalStore } from "react"

/** @internal */
export const make = <R>(
  runtimeContext: RuntimeProvider.RuntimeContext<R>
): RuntimeProvider.UseResultCallback<R> =>
  <Args extends Array<any>, R0 extends R, E, A>(
    f: (...args: Args) => Stream.Stream<R0, E, A>
  ): readonly [ResultBag.ResultBag<E, A>, (...args: Args) => void] => {
    const runtime = useContext(runtimeContext)
    const storeRef = useRef<FiberStore.FiberStore<R0, E, A>>(undefined as any)
    if (storeRef.current === undefined) {
      storeRef.current = FiberStore.make(runtime)
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
