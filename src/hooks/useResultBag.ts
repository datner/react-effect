import { pipe } from "@effect/data/Function"
import * as N from "@effect/data/Number"
import * as Option from "@effect/data/Option"
import * as Order from "@effect/data/Order"
import * as Cause from "@effect/io/Cause"
import * as Result from "effect-react/Result"
import type { MutableRefObject } from "react"
import { useMemo, useRef } from "react"

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

export const initialTrackedProps = (): TrackedProperties => ({
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
})

const optionDateGreaterThan = pipe(
  N.Order,
  Order.mapInput((_: Date) => _.getTime()),
  Option.getOrder,
  Order.greaterThan
)

export const updateNext = <E, A>(
  next: Result.Result<E, A>,
  tracked: MutableRefObject<TrackedProperties>
): Result.Result<E, A> => {
  updateTrackedProps(next, tracked.current)
  return next
}

export const updateTrackedProps = <E, A>(
  next: Result.Result<E, A>,
  tracked: TrackedProperties
) => {
  tracked.currentStatus = next._tag

  switch (next._tag) {
    case "Initial": {
      break
    }
    case "Waiting": {
      break
    }
    case "Failure": {
      if (Cause.isFailure(next.cause)) {
        tracked.currentFailureCount++
        tracked.currentErrorCount++
        tracked.runningErrorCount++
        tracked.errorUpdatedAt = Option.some(new Date())
        break
      }
      if (!Cause.isInterruptedOnly(next.cause)) {
        tracked.currentDefectCount++
        tracked.currentErrorCount++
        tracked.runningErrorCount++
      }

      break
    }
    case "Success": {
      tracked.currentFailureCount = 0
      tracked.currentDefectCount = 0
      tracked.dataUpdatedAt = Option.some(new Date())
      break
    }
  }
}

export const makeResultBag = <E, A>(result: Result.Result<E, A>, tracked: TrackedProperties): ResultBag<E, A> => ({
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

export const useResultBag = <E, A>(result: Result.Result<E, A>) => {
  const trackedPropsRef = useRef<TrackedProperties>(null as any)
  if (trackedPropsRef.current === null) {
    trackedPropsRef.current = initialTrackedProps()
  }

  const resultBag = useMemo(
    (): ResultBag<E, A> => makeResultBag(result, trackedPropsRef.current),
    [result]
  )

  return [trackedPropsRef, resultBag] as const
}
