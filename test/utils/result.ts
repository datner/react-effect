import type * as Cause from "@effect/io/Cause"
import * as fc from "fast-check"
import * as Result from "react-effect/Result"
import { causes } from "./cause"

export const init = fc.constant(Result.init)
export const failure = <E>(fail: fc.Arbitrary<E>) => fail.map(Result.fail)
export const defect = <D>(cause: fc.Arbitrary<Cause.Cause<D>>) => cause.map(Result.defect)
export const success = <A>(success: fc.Arbitrary<A>) => success.map(Result.success)
export const waiting = <D, E, A>(
  value: fc.Arbitrary<A>,
  error: fc.Arbitrary<E>,
  cause: fc.Arbitrary<Cause.Cause<D>>
) => fc.oneof(init, failure(error), defect(cause), success(value)).map(Result.waiting)

export const resultArb: <D, E, A>(
  value: fc.Arbitrary<A>,
  error: fc.Arbitrary<E>,
  cause: fc.Arbitrary<Cause.Cause<D>>
) => fc.Arbitrary<Result.Result<D, E, A>> = <D, E, A>(
  value: fc.Arbitrary<A>,
  error: fc.Arbitrary<E>,
  cause: fc.Arbitrary<Cause.Cause<D>>
) => fc.oneof(init, failure(error), defect(cause), success(value), waiting(value, error, cause))

export const result: fc.Arbitrary<Result.Result<string, number, string>> = resultArb(
  fc.string(),
  fc.integer(),
  causes
)
