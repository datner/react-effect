import type * as Data from "@effect/data/Data"
import type * as Option from "@effect/data/Option"
import type { Pipeable } from "@effect/data/Pipeable"
import type * as Unify from "@effect/data/Unify"
import type * as Cause from "@effect/io/Cause"
import type * as Effect from "@effect/io/Effect"
import type * as Exit from "@effect/io/Exit"
import * as internal from "react-effect/internal/result"

// -------------------------------------------------------------------------------------
// models
// -------------------------------------------------------------------------------------

/**
 * A `Result` represents the current state of some `Effect` workflow.
 *
 * @since 1.0.0
 * @category models
 */
export type Result<E, A> =
  | Initial<E, A>
  | Waiting<Result<E, A>>
  | Success<E, A>
  | Failure<E, A>

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

/**
 * @since 1.0.0
 */
export declare namespace Result {
  /**
   * @category models
   * @since 1.0.0
   */
  export interface Unify<A extends { [Unify.typeSymbol]?: any }> extends Effect.EffectUnify<A> {
    Result?: () => A[Unify.typeSymbol] extends Result<infer E0, infer A0> | infer _ ? Result<E0, A0> : never
  }

  export interface Variance<E, A> {
    _E: () => E
    _A: () => A
  }

  /**
   * @category models
   * @since 1.0.0
   */
  export interface UnifyBlackList extends Effect.EffectUnifyBlacklist {
    Effect?: true
  }

  /**
   * @since 1.0.0
   * @category type-level
   */
  export type Error<T extends Result<any, any>> = [T] extends [Result<infer _E, infer _A>] ? _E : never

  /**
   * @since 1.0.0
   * @category type-level
   */
  export type Success<T extends Result<any, any>> = [T] extends [Result<infer _E, infer _A>] ? _A : never
}

/**
 * The `Fail` result represents a `Result` which failed with an expected error of
 * type `E`.
 *
 * @category models
 * @since 1.0.0
 */
export interface Failure<E, A> extends Data.Case, Pipeable {
  readonly _tag: "Failure"
  readonly cause: Cause.Cause<E>
  [TypeId]?: Result.Variance<E, A>
  [Unify.typeSymbol]?: unknown
  [Unify.unifySymbol]?: Result.Unify<this>
  [Unify.blacklistSymbol]?: Result.UnifyBlackList
  /** @internal */
  readonly i0: Cause.Cause<E>
}

/**
 * The `Success` result represents a `Result` which succeeded with a value of
 * type `A`.
 *
 * @since 1.0.0
 * @category models
 */
export interface Success<E, A> extends Data.Case, Pipeable {
  readonly _tag: "Success"
  readonly value: A
  [TypeId]?: Result.Variance<E, A>
  [Unify.typeSymbol]?: unknown
  [Unify.unifySymbol]?: Result.Unify<this>
  [Unify.blacklistSymbol]?: Result.UnifyBlackList
  /** @internal */
  readonly i0: A
}

/**
 * The `Waiting` result represents a `Result` which is still waiting to resolve.
 *
 * @since 1.0.0
 * @category models
 */
export interface Waiting<Previous extends Result<any, any>> extends Data.Case, Pipeable {
  readonly _tag: "Waiting"
  readonly previous: Previous
  [TypeId]?: Result.Variance<Result.Error<Previous>, Result.Success<Previous>>
  [Unify.typeSymbol]?: unknown
  [Unify.unifySymbol]?: Result.Unify<this>
  [Unify.blacklistSymbol]?: Result.UnifyBlackList
  /** @internal */
  readonly i0: Previous
}

/**
 * The `Initial` result represents an empty `Result`
 *
 * @since 1.0.0
 * @category models
 */
export interface Initial<E = never, A = never> extends Data.Case, Pipeable {
  readonly _tag: "Initial"
  [TypeId]?: Result.Variance<E, A>
  [Unify.typeSymbol]?: unknown
  [Unify.unifySymbol]?: Result.Unify<this>
  [Unify.blacklistSymbol]?: Result.UnifyBlackList
  /** @internal */
  readonly i0: never
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
export const initial: () => Result<never, never> = internal.initial

/**
 * Constructs a new `Result` that 'remembers' the previous `Result`.
 * `Waiting` represents the indeterminate state between other states.
 *
 * @since 1.0.0
 * @category constructors
 */
export const waiting: <E, A>(previous: Result<E, A>) => Result<E, A> = internal.waiting

/**
 * Constructs a new `Result` from a a specified error.
 * `Fail` represents that the effect ended with a known error.
 * This is useful to handle both valid and invalid results in a determinate fashion,
 * for example to catch auth errors and communicate to the user that they need to log in
 *
 * @since 1.0.0
 * @category constructors
 */
export const fail: <E>(failure: E) => Result<E, never> = internal.fail

/**
 * Constructs a new `Result` from a a specified Cause.
 * `Fail` represents that the effect ended with a known error.
 * This is useful to handle both valid and invalid results in a determinate fashion,
 * for example to catch auth errors and communicate to the user that they need to log in
 *
 * @since 1.0.0
 * @category constructors
 */
export const failCause: <E>(cause: Cause.Cause<E>) => Result<E, never> = internal.failCause

/**
 * Constructs a new `Result` from a specified value
 * `Success` represents that the effect finishined successfuly and carries the yielded value
 *
 * @since 1.0.0
 * @category constructors
 */
export const success: <A>(value: A) => Result<never, A> = internal.success

/**
 * Constructs a new `Result` from a a specified exit
 *
 * @since 1.0.0
 * @category constructors
 */
export const fromExit: <E, A>(exit: Exit.Exit<E, A>) => Result<E, A> = internal.fromExit

// -----------------------------------------------------------------------------
// Refinements
// -----------------------------------------------------------------------------

/**
 * Tests if a value is a `Result`.
 *
 * @since 1.0.0
 * @category refinements
 */
export const isResult: (u: unknown) => u is Result<unknown, unknown> = internal.isResult

/**
 * Determine if a `Result` is an `Initial`.
 *
 * @since 1.0.0
 * @category refinements
 */
export const isInitial: <E, A>(self: Result<E, A>) => self is Initial<E, A> = internal.isInitial

/**
 * Determine if a `Result` is a `Failure`.
 *
 * @since 1.0.0
 * @category refinements
 */
export const isFailure: <E, A>(self: Result<E, A>) => self is Failure<E, A> = internal.isFailure

/**
 * Determine if a `Result` is a `Success`.
 *
 * @since 1.0.0
 * @category refinements
 */
export const isSuccess: <E, A>(self: Result<E, A>) => self is Success<E, A> = internal.isSuccess

/**
 * Determine if a `Result` is a `Failure`.
 *
 * @since 1.0.0
 * @category refinements
 * @alias isFailure
 */
export const isError: <E, A>(self: Result<E, A>) => self is Failure<E, A> = internal.isFailure

/**
 * Determine if a `Result` is a `Waiting`
 *
 * @since 1.0.0
 * @category refinements
 */
export const isWaiting: <E, A>(self: Result<E, A>) => self is Waiting<Result<E, A>> = internal.isWaiting

/**
 * Determine if a `Result` is a `Waiting` on the first result
 *
 * @since 1.0.0
 * @category refinements
 */
export const isLoading: <E, A>(self: Result<E, A>) => self is Waiting<Initial<E, A>> = internal.isLoading

/**
 * Determine if a `Result` is a `Waiting` with a previous `Success`
 *
 * @since 1.0.0
 * @category refinements
 */
export const isRefreshing: <E, A>(self: Result<E, A>) => self is Waiting<Success<E, A>> = internal.isRefreshing

/**
 * Determine if a `Result` is a `Waiting` with a previous `Fail`
 *
 * @since 1.0.0
 * @category refinements
 */
export const isRetrying: <E, A>(self: Result<E, A>) => self is Waiting<Failure<E, A>> = internal.isRetrying

// -----------------------------------------------------------------------------
// Getters
// -----------------------------------------------------------------------------

/**
 * Safely lookup the failure in a `Result`
 *
 * @since 1.0.0
 * @category getters
 */
export const getFailure: <E, A>(self: Result<E, A>) => Option.Option<E> = internal.getFailure

/**
 * Safely lookup the value in a `Result`
 *
 * @since 1.0.0
 * @category getters
 */
export const getValue: <E, A>(self: Result<E, A>) => Option.Option<A> = internal.getValue

/**
 * Gets the equivalent `Exit` for a `Result`
 * Note: if `Result` is `Waiting`, the `Exit` will produce the values for the previous `Result`
 *
 * @since 1.0.0
 * @category getters
 */
export const getExit: <E, A>(self: Result<E, A>) => Exit.Exit<E | Cause.NoSuchElementException, A> = internal.getExit

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
  <A2>(value: A2): <E, A>(self: Result<E, A>) => Result<E, A2>
  <E, A, A2>(self: Result<E, A>, value: A2): Result<E, A2>
} = internal.as

/**
 * Maps the `Success` value of a `Result` value to a new `Result` value.
 *
 * @since 1.0.0
 * @category mapping
 */
export const map: {
  <A, A2>(f: (a: A) => A2): <E>(self: Result<E, A>) => Result<E, A2>
  <E, A, A2>(self: Result<E, A>, f: (a: A) => A2): Result<E, A2>
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
  <A, E2, A2>(f: (a: A) => Result<E2, A2>): <E>(self: Result<E, A>) => Result<E2 | E, A2>
  <E, A, E2, A2>(self: Result<E, A>, f: (a: A) => Result<E2, A2>): Result<E | E2, A2>
} = internal.flatMap

/**
 * @since 1.0.0
 * @category tranforming
 */
export const flatten: <E, E1, A>(self: Result<E, Result<E1, A>>) => Result<E | E1, A> = internal.flatten
