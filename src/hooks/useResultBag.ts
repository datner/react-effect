import { pipe } from "@effect/data/Function"
import * as N from "@effect/data/Number"
import * as Option from "@effect/data/Option"
import * as Order from "@effect/data/Order"
import * as Cause from "@effect/io/Cause"
import type { MutableRefObject } from "react"
import { useMemo, useRef } from "react"
import * as Result from "react-effect/Result"

export interface ResultBag<D, E, A> {
  readonly result: Result.Result<D, E, A>
  readonly dataUpdatedAt: Option.Option<Date>
  readonly errorUpdatedAt: Option.Option<Date>
  readonly errorRunningCount: number
  readonly failureCount: number
  readonly failureCause: Cause.Cause<D | E>
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

export interface TrackedProperties {
  dataUpdatedAt: Option.Option<Date>
  errorUpdatedAt: Option.Option<Date>
  currentErrorCount: number
  currentFailureCount: number
  currentDefectCount: number
  runningErrorCount: number
  invocationCount: number
  interruptCount: number
  currentStatus: Result.Result<any, any, any>["_tag"]
  failureCause: Cause.Cause<unknown>
}

const initial: TrackedProperties = {
  dataUpdatedAt: Option.none(),
  errorUpdatedAt: Option.none(),
  currentErrorCount: 0,
  currentFailureCount: 0,
  runningErrorCount: 0,
  currentDefectCount: 0,
  invocationCount: 0,
  interruptCount: 0,
  currentStatus: "Initial",
  failureCause: Cause.empty
}

const optionDateGreaterThan = pipe(
  N.Order,
  Order.mapInput((_: Date) => _.getTime()),
  Option.getOrder,
  Order.greaterThan
)

export const updateNext = <D, E, A>(
  next: Result.Result<D, E, A>,
  ref: MutableRefObject<TrackedProperties>
): Result.Result<D, E, A> => {
  switch (next._tag) {
    case "Initial": {
      break
    }
    case "Waiting": {
      break
    }
    case "Defect": {
      ref.current.currentDefectCount++
      ref.current.currentErrorCount++
      ref.current.runningErrorCount++
      break
    }
    case "Fail": {
      ref.current.currentFailureCount++
      ref.current.currentErrorCount++
      ref.current.runningErrorCount++
      ref.current.errorUpdatedAt = Option.some(new Date())
      break
    }
    case "Success": {
      ref.current.currentFailureCount = 0
      ref.current.currentDefectCount = 0
      ref.current.dataUpdatedAt = Option.some(new Date())
      break
    }
  }
  return next
}

export const useResultBag = <D, E, A>(result: Result.Result<D, E, A>) => {
  const trackedPropsRef = useRef<TrackedProperties>(initial)

  const resultBag = useMemo((): ResultBag<D, E, A> => ({
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
      return Result.isRetrying(result) && Option.isNone(trackedPropsRef.current.dataUpdatedAt)
    },
    get isRefreshing() {
      return Result.isRefreshing(result)
    },
    get isRetrying() {
      return Result.isRetrying(result)
    },
    get isRefreshingFailure() {
      return Result.isRetrying(result)
        && optionDateGreaterThan(trackedPropsRef.current.dataUpdatedAt, trackedPropsRef.current.errorUpdatedAt)
    },
    get dataUpdatedAt() {
      return trackedPropsRef.current.dataUpdatedAt
    },
    get errorUpdatedAt() {
      return trackedPropsRef.current.errorUpdatedAt
    },
    get failureCount() {
      return trackedPropsRef.current.currentFailureCount
    },
    get failureCause() {
      return trackedPropsRef.current.failureCause as Cause.Cause<D | E>
    },
    get errorRunningCount() {
      return trackedPropsRef.current.runningErrorCount
    }
  }), [result])

  return [trackedPropsRef, resultBag] as const
}
