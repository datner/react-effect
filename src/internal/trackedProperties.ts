import * as Option from "@effect/data/Option"
import * as Cause from "@effect/io/Cause"
import type * as Result from "effect-react/Result"
import type * as TrackedProperties from "effect-react/TrackedProperties"

/** @internal */
export const initial = (): TrackedProperties.TrackedProperties => ({
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

/** @internal */
export const updateFromResult = <E, A>(
  self: TrackedProperties.TrackedProperties,
  result: Result.Result<E, A>
) => {
  self.currentStatus = result._tag

  switch (result._tag) {
    case "Initial": {
      break
    }
    case "Waiting": {
      break
    }
    case "Failure": {
      if (Cause.isFailure(result.cause)) {
        self.currentFailureCount++
        self.currentErrorCount++
        self.runningErrorCount++
        self.errorUpdatedAt = Option.some(new Date())
        break
      }
      if (!Cause.isInterruptedOnly(result.cause)) {
        self.currentDefectCount++
        self.currentErrorCount++
        self.runningErrorCount++
      }

      break
    }
    case "Success": {
      self.currentFailureCount = 0
      self.currentDefectCount = 0
      self.dataUpdatedAt = Option.some(new Date())
      break
    }
  }
}
