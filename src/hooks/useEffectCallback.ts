import * as Effect from "@effect/io/Effect"
import * as Exit from "@effect/io/Exit"
import { useCallback, useRef, useState } from "react"
import type { ResultBag } from "react-effect/hooks/useResultBag"
import { updateNext, useResultBag } from "react-effect/hooks/useResultBag"
import { useStitch } from "react-effect/hooks/useStitch"
import type { RuntimeContext } from "react-effect/internal/runtimeContext"
import * as Result from "react-effect/Result"

export type UseEffectCallback<R, D> = <Args extends Array<any>, E, A>(
  effecter: (...args: Args) => Effect.Effect<R, E, A>
) => readonly [ResultBag<D, E, A>, (...args: Args) => void]

export const makeUseEffectCallback: <R, D>(runtimeContext: RuntimeContext<R, D>) => UseEffectCallback<R, D> = <R, D>(
  runtimeContext: RuntimeContext<R, D>
) =>
  <Args extends Array<any>, E, A>(effecter: (...args: Args) => Effect.Effect<R, E, A>) => {
    const stitch = useStitch(runtimeContext)
    const cancelRef = useRef<(() => void) | undefined>(undefined)
    const [result, setResult] = useState<Result.Result<D, E, A>>(Result.init)
    const [trackRef, resultBag] = useResultBag(result)
    trackRef.current.currentStatus = result._tag

    const run = useCallback((...args: Args) => {
      trackRef.current.invocationCount++
      if (cancelRef.current) {
        if (trackRef.current.currentStatus === "Waiting") {
          trackRef.current.interruptCount++
        }
        cancelRef.current()
      }

      setResult(Result.waiting)

      const cancel = Effect.runCallback(
        stitch(Effect.either(effecter(...args))),
        (exit) => {
          if (Exit.isInterrupted(exit)) {
            return
          }
          setResult(updateNext(Result.fromExitEither(exit), trackRef))
        }
      )

      cancelRef.current = cancel
    }, [stitch])

    return [resultBag, run] as const
  }
