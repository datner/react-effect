import * as Result from "effect-react/Result"
import * as fc from "fast-check"

export const init = fc.constant(Result.initial())
export const failure = <E>(fail: fc.Arbitrary<E>) => fail.map(Result.fail)
export const success = <A>(success: fc.Arbitrary<A>) => success.map(Result.success)
export const waiting = <E, A>(
  value: fc.Arbitrary<A>,
  error: fc.Arbitrary<E>
) => fc.oneof(init, failure(error), success(value)).map(Result.waiting)

export const resultArb: <E, A>(
  value: fc.Arbitrary<A>,
  error: fc.Arbitrary<E>
) => fc.Arbitrary<Result.Result<E, A>> = <E, A>(
  value: fc.Arbitrary<A>,
  error: fc.Arbitrary<E>
) => fc.oneof(init, failure(error), success(value), waiting(value, error))

export const result: fc.Arbitrary<Result.Result<number, string>> = resultArb(
  fc.string(),
  fc.integer()
)
