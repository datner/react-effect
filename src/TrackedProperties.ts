import type * as Option from "@effect/data/Option"
import type * as Cause from "@effect/io/Cause"
import * as internal from "effect-react/internal/trackedProperties"
import type * as Result from "effect-react/Result"

/**
 * @since 1.0.0
 * @category models
 */
export interface TrackedProperties {
  dataUpdatedAt: Option.Option<Date>
  errorUpdatedAt: Option.Option<Date>
  currentErrorCount: number
  currentFailureCount: number
  currentDefectCount: number
  runningErrorCount: number
  invocationCount: number
  interruptCount: number
  currentStatus: Result.Result<any, any>["_tag"]
  failureCause: Cause.Cause<unknown>
}

/**
 * @since 1.0.0
 * @category constructors
 */
export const initial: () => TrackedProperties = internal.initial

/**
 * @since 1.0.0
 * @category combinators
 */
export const updateFromResult: <E, A>(self: TrackedProperties, result: Result.Result<E, A>) => void =
  internal.updateFromResult
