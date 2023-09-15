/**
 * @since 1.0.0
 */
import type * as Option from "@effect/data/Option"
import type * as Cause from "@effect/io/Cause"
import * as internal from "effect-react/internal/resultBag"
import type * as Result from "effect-react/Result"
import type * as TrackedProperties from "effect-react/ResultBag/TrackedProperties"

/**
 * @since 1.0.0
 * @category models
 */
export interface ResultBag<E, A> {
  readonly result: Result.Result<E, A>
  readonly dataUpdatedAt: Option.Option<Date>
  readonly errorUpdatedAt: Option.Option<Date>
  readonly errorRunningCount: number
  readonly failureCount: number
  readonly failureCause: Cause.Cause<E>
  readonly isError: boolean
  readonly isRefreshing: boolean
  readonly isRetrying: boolean
  readonly isLoading: boolean
  readonly isLoadingFailure: boolean
  readonly isRefreshingFailure: boolean
  readonly isSuccess: boolean
  // readonly isFetched: boolean;
  // readonly isFetchedAfterMount: boolean;
  // readonly isInitialLoading: boolean;
  // readonly isPreviousData: boolean;
}

/**
 * @since 1.0.0
 * @category constructors
 */
export const make: <E, A>(
  result: Result.Result<E, A>,
  tracked: TrackedProperties.TrackedProperties
) => ResultBag<E, A> = internal.make
