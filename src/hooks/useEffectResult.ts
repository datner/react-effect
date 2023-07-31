import * as Effect from "@effect/io/Effect"
import * as Exit from "@effect/io/Exit"
import * as Fiber from "@effect/io/Fiber"
import * as Schedule from "@effect/io/Schedule"
import { useEffect, useState } from "react"
import type { ResultBag } from "react-effect/hooks/useResultBag"
import { updateNext, useResultBag } from "react-effect/hooks/useResultBag"
import { useStitch } from "react-effect/hooks/useStitch"
import type { RuntimeContext } from "react-effect/internal/runtimeContext"
import * as Result from "react-effect/Result"

export type UseEffectResult<R, D> = <E, A>(
  effect: Effect.Effect<R, E, A>,
  repeatSchedule?: Schedule.Schedule<never, unknown, unknown>
) => ResultBag<D, E, A>

export const makeUseEffectResult: <R, D>(
  runtimeContext: RuntimeContext<R, D>
) => UseEffectResult<R, D> = <R, D>(runtimeContext: RuntimeContext<R, D>) =>
  <E, A>(effect: Effect.Effect<R, E, A>, repeatSchedule?: Schedule.Schedule<never, unknown, unknown>) => {
    const stitch = useStitch(runtimeContext)
    const [result, setResult] = useState<Result.Result<D, E, A>>(Result.init)
    const [trackRef, resultBag] = useResultBag(result)
    trackRef.current.currentStatus = result._tag

    useEffect(() => {
      const fiber = effect.pipe(
        Effect.either,
        stitch,
        Effect.exit,
        Effect.tap((exit) =>
          Effect.sync(() => {
            if (Exit.isInterrupted(exit)) {
              return
            }
            setResult(updateNext(Result.fromExitEither(exit), trackRef))
          })
        ),
        Effect.ignore,
        Effect.repeat(repeatSchedule ?? Schedule.stop),
        Effect.runFork
      )

      return () => {
        Effect.runSync(Fiber.interruptFork(fiber))
      }
    }, [effect, Effect.schedule])

    return resultBag
  }
