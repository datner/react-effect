import * as Either from "@effect/data/Either"
import type * as HashMap from "@effect/data/HashMap"
import type * as Option from "@effect/data/Option"
import type * as Cause from "@effect/io/Cause"
import type * as Exit from "@effect/io/Exit"
import * as internal from "react-effect/internal/result"

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * A `Result` represents the current state of some `Effect` workflow.
 *
 * @since 1.0.0
 * @category models
 */
export type Result<D, E, A> =
  | Initial
  | Waiting<CurrentResult<D, E, A>>
  | Defect<D>
  | Fail<E>
  | Success<A>

export type CurrentResult<D, E, A> =
  | Initial
  | Defect<D>
  | Fail<E>
  | Success<A>

/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId: unique symbol = internal.TypeId

/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId

// ---------------------------------------------
// models
// ---------------------------------------------

/**
 * @since 1.0.0
 */
export declare namespace Result {
  /**
   * @since 1.0.0
   * @category models
   */
  export interface Variance<D, E, A> {
    readonly [TypeId]: {
      readonly _D: (_: never) => D
      readonly _E: (_: never) => E
      readonly _A: (_: never) => A
    }
  }

  /**
   * @since 1.0.0
   * @category type-level
   */
  export type Defect<T extends Result<any, any, any>> = [T] extends [Result<infer _D, infer _E, infer _A>] ? _D : never
  /**
   * @since 1.0.0
   * @category type-level
   */
  export type Error<T extends Result<any, any, any>> = [T] extends [Result<infer _D, infer _E, infer _A>] ? _E : never
  /**
   * @since 1.0.0
   * @category type-level
   */
  export type Success<T extends Result<any, any, any>> = [T] extends [Result<infer _D, infer _E, infer _A>] ? _A
    : never
}

/**
 * @category model
 * @since 1.0.0
 */
export interface Annotations extends HashMap.HashMap<string | symbol, unknown> {}

/**
 * @since 1.0.0
 * @category models
 */
export interface Annotated {
  readonly annotations: Annotations
}

/**
 * The `Fail` result represents a `Result` which failed with an expected error of
 * type `E`.
 *
 * @category models
 * @since 1.0.0
 */
export interface Fail<E> extends internal.Base<never, E, never> {
  readonly _tag: "Fail"
  get error(): E
}

/**
 * The `Defect` result represents a `Result` which failed with an unexpected error of
 * type `D`.
 *
 * @since 1.0.0
 * @category models
 */
export interface Defect<D> extends internal.Base<D, never, never> {
  readonly _tag: "Defect"
  get cause(): Cause.Cause<D>
}

/**
 * The `Success` result represents a `Result` which succeeded with a value of
 * type `A`.
 *
 * @since 1.0.0
 * @category models
 */
export interface Success<A> extends internal.Base<never, never, A> {
  readonly _tag: "Success"
  get value(): A
}

/**
 * The `Waiting` result represents a `Result` which is still waiting to resolve.
 *
 * @since 1.0.0
 * @category models
 */
export interface Waiting<Previous extends CurrentResult<any, any, any>> extends
  internal.Base<
    Result.Defect<Previous>,
    Result.Error<Previous>,
    Result.Success<Previous>
  >
{
  readonly _tag: "Waiting"
  get previous(): Previous
}

Either.left

/**
 * The `Initial` result represents an empty `Result`
 *
 * @since 1.0.0
 * @category models
 */
export interface Initial extends internal.Base<never, never, never> {
  readonly _tag: "Initial"
}

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------
// Creates a new `Option` that wraps the given value.

// Constructs a new `Either` holding a `Right` value. This usually represents a successful value due to the right bias
// of this structure.

/**
 * Constructs a new empty `Result`. This represents the initial starting point of a `Request`
 *
 * @since 1.0.0
 * @category constructors
 */
export const init: Result<never, never, never> = internal.init

/**
 * Constructs a new `Result` that 'remembers' the previous `Result`.
 * `Waiting` represents the indeterminate state between other states.
 *
 * @since 1.0.0
 * @category constructors
 */
export const waiting: <D, E, A>(previous: Result<D, E, A>) => Result<D, E, A> = internal.waiting

/**
 * Constructs a new `Result` from a specified cause.
 * `Defect` represents that the effect ended for an unexpected reason
 *
 * @since 1.0.0
 * @category constructors
 */
export const defect: <D>(previous: Cause.Cause<D>) => Result<D, never, never> = internal.defect

/**
 * Constructs a new `Result` from a a specified error.
 * `Fail` represents that the effect ended with a known error.
 * This is useful to handle both valid and invalid results in a determinate fashion,
 * for example to catch auth errors and communicate to the user that they need to log in
 *
 * @since 1.0.0
 * @category constructors
 */
export const fail: <E>(error: E) => Result<never, E, never> = internal.fail

/**
 * Constructs a new `Result` from a specified value
 * `Success` represents that the effect finishined successfuly and carries the yielded value
 *
 * @since 1.0.0
 * @category constructors
 */
export const success: <A>(value: A) => Result<never, never, A> = internal.success

/**
 * Constructs a new `Result` from a a specified exit either.
 * This is useful for interop with `Effect.either` and `Effect.runCallback`.
 * This function assumes that a failed exit is always a defect.
 *
 * @since 1.0.0
 * @category constructors
 */
export const fromExitEither: <D, E, A>(
  exit: Exit.Exit<D, Either.Either<E, A>>
) => Result<D, E, A> = internal.fromExitEither

// -----------------------------------------------------------------------------
// Refinements
// -----------------------------------------------------------------------------
Either.isLeft
/**
 * Tests if a value is a `Result`.
 *
 * @since 1.0.0
 * @category refinements
 */
export const isResult: (u: unknown) => u is Result<unknown, unknown, unknown> = internal.isResult

/**
 * Determine if a `Result` is an `Initial`.
 *
 * @since 1.0.0
 * @category refinements
 */
export const isInitial: <D, E, A>(self: Result<D, E, A>) => self is Initial = internal.isInitial

/**
 * Determine if a `Result` is a `Fail`.
 *
 * @since 1.0.0
 * @category refinements
 */
export const isFail: <D, E, A>(u: Result<D, E, A>) => boolean = internal.isFail

/**
 * Determine if a `Result` is a `Success`.
 *
 * @since 1.0.0
 * @category refinements
 */
export const isSuccess: <D, E, A>(self: Result<D, E, A>) => self is Success<A> = internal.isSuccess

/**
 * Determine if a `Result` is a `Defect`.
 *
 * @since 1.0.0
 * @category refinements
 */
export const isDefect: <D, E, A>(self: Result<D, E, A>) => self is Defect<D> = internal.isDefect

/**
 * Determine if a `Result` is a `Defect` or `Fail`.
 * This is helpful to represent a blanket "didn't work"
 *
 * @since 1.0.0
 * @category refinements
 */
export const isError: <D, E, A>(self: Result<D, E, A>) => self is Defect<D> | Fail<E> = internal.isError

/**
 * Determine if a `Result` is a `Waiting`
 *
 * @since 1.0.0
 * @category refinements
 */
export const isWaiting: <D, E, A>(self: Result<D, E, A>) => self is Waiting<CurrentResult<D, E, A>> = internal.isWaiting

/**
 * Determine if a `Result` is a `Waiting` on the first result
 *
 * @since 1.0.0
 * @category refinements
 */
export const isLoading: <D, E, A>(self: Result<D, E, A>) => self is Waiting<Initial> = internal.isLoading

/**
 * Determine if a `Result` is a `Waiting` with a previous `Success`
 *
 * @since 1.0.0
 * @category refinements
 */
export const isRefreshing: <D, E, A>(self: Result<D, E, A>) => self is Waiting<Success<A>> = internal.isRefreshing

/**
 * Determine if a `Result` is a `Waiting` with a previous `Fail`
 *
 * @since 1.0.0
 * @category refinements
 */
export const isRetrying: <D, E, A>(self: Result<D, E, A>) => self is Waiting<Fail<E>> = internal.isRetrying

// -----------------------------------------------------------------------------
// Getters
// -----------------------------------------------------------------------------

/**
 * Safely lookup the failure in a `Result`
 *
 * @since 1.0.0
 * @category getters
 */
export const getFailure: <D, E, A>(u: Result<D, E, A>) => Option.Option<E> = internal.getFailure

/**
 * Safely lookup the defect in a `Result`
 *
 * @since 1.0.0
 * @category getters
 */
export const getDefect: <D, E, A>(u: Result<D, E, A>) => Option.Option<Cause.Cause<D>> = internal.getDefect

/**
 * Safely lookup the value in a `Result`
 *
 * @since 1.0.0
 * @category getters
 */
export const getValue: <D, E, A>(u: Result<D, E, A>) => Option.Option<A> = internal.getValue

/**
 * Gets the equivalent `Exit` for a `Result`
 * Note: if `Result` is `Waiting`, the `Exit` will produce the values for the previous `Result`
 *
 * @since 1.0.0
 * @category getters
 */
export const getExit: <D, E, A>(u: Result<D, E, A>) => Exit.Exit<D, Either.Either<E, A>> = internal.getExit

// -----------------------------------------------------------------------------
// Mapping
// -----------------------------------------------------------------------------

/**
 * Sets the `Success` value of a `Result` to the specified constant value..
 *
 * @since 1.0.0
 * @category mapping
 */
export const as: {
  <A2>(value: A2): <D, E, A>(self: Result<D, E, A>) => Result<D, E, A2>
  <D, E, A, A2>(self: Result<D, E, A>, value: A2): Result<D, E, A2>
} = internal.as

/**
 * Maps the `Success` value of a `Result` value to a new `Result` value.
 *
 * @since 1.0.0
 * @category mapping
 */
export const map: {
  <A, A2>(f: (a: A) => A2): <D, E>(self: Result<D, E, A>) => Result<D, E, A2>
  <D, E, A, A2>(self: Result<D, E, A>, f: (a: A) => A2): Result<D, E, A2>
} = internal.map

// -----------------------------------------------------------------------------
// Transforming
// -----------------------------------------------------------------------------

/**
 * Applies a function to the success value of a `Result` and flattens the result, if the input is `Success`.
 *
 * @since 1.0.0
 * @category tranforming
 */
export const flatMap: {
  <A, D2, E2, A2>(
    f: (a: A) => Result<D2, E2, A2>
  ): <D, E>(self: Result<D, E, A>) => Result<D | D2, E | E2, A2>
  <D, E, A, D2, E2, A2>(
    self: Result<D, E, A>,
    f: (a: A) => Result<D2, E2, A2>
  ): Result<D | D2, E | E2, A2>
} = internal.flatMap

/**
 * @since 1.0.0
 * @category tranforming
 */
export const flatten: <D, E, D1, E1, A>(
  self: Result<D, E, Result<D1, E1, A>>
) => Result<D | D1, E | E1, A> = internal.flatten
