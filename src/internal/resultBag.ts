import { pipe } from "@effect/data/Function"
import * as N from "@effect/data/Number"
import * as Option from "@effect/data/Option"
import * as Order from "@effect/data/Order"
import type * as Cause from "@effect/io/Cause"
import * as Result from "effect-react/Result"
import type * as ResultBag from "effect-react/ResultBag"
import type * as TrackedProperties from "effect-react/ResultBag/TrackedProperties"

const optionDateGreaterThan = pipe(
  N.Order,
  Order.mapInput((_: Date) => _.getTime()),
  Option.getOrder,
  Order.greaterThan
)

/** @internal */
export const make = <E, A>(
  result: Result.Result<E, A>,
  tracked: TrackedProperties.TrackedProperties
): ResultBag.ResultBag<E, A> => ({
  result,
  get isLoading() {
    return Result.isLoading(result)
  },
  get isError() {
    return Result.isError(result)
  },
  get isSuccess() {
    return Result.isSuccess(result)
  },
  get isLoadingFailure() {
    return Result.isRetrying(result) && Option.isNone(tracked.dataUpdatedAt)
  },
  get isRefreshing() {
    return Result.isRefreshing(result)
  },
  get isRetrying() {
    return Result.isRetrying(result)
  },
  get isRefreshingFailure() {
    return Result.isRetrying(result)
      && optionDateGreaterThan(tracked.dataUpdatedAt, tracked.errorUpdatedAt)
  },
  get dataUpdatedAt() {
    return tracked.dataUpdatedAt
  },
  get errorUpdatedAt() {
    return tracked.errorUpdatedAt
  },
  get failureCount() {
    return tracked.currentFailureCount
  },
  get failureCause() {
    return tracked.failureCause as Cause.Cause<E>
  },
  get errorRunningCount() {
    return tracked.runningErrorCount
  }
})
