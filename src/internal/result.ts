import type * as Data from "@effect/data/Data"
import * as Equal from "@effect/data/Equal"
import { absurd, dual, identity } from "@effect/data/Function"
import * as Hash from "@effect/data/Hash"
import * as Option from "@effect/data/Option"
import type { Pipeable } from "@effect/data/Pipeable"
import { pipeArguments } from "@effect/data/Pipeable"
import * as Cause from "@effect/io/Cause"
import * as Exit from "@effect/io/Exit"
import type * as Result from "react-effect/Result"

// -----------------------------------------------------------------------------
// Models
// -----------------------------------------------------------------------------

/** @internal */
export interface Base<D, E, A> extends Data.Case, Pipeable {
  readonly _id: Result.TypeId
  readonly [TypeId]: {
    readonly _A: (_: never) => A
    readonly _E: (_: never) => E
    readonly _D: (_: never) => D
  }
}

/** @internal */
export const TypeId: Result.TypeId = Symbol.for(
  "react-effect/result"
) as Result.TypeId

// -----------------------------------------------------------------------------
// Getters
// -----------------------------------------------------------------------------

/** @internal */
export const getFailure = <E, A>(self: Result.Result<E, A>): Option.Option<E> =>
  find<E, A, E>(self, (result) =>
    result._tag === "Failure"
      ? Cause.failureOption(result.cause)
      : Option.none())

/** @internal */
export const getValue = <E, A>(self: Result.Result<E, A>): Option.Option<A> =>
  find<E, A, A>(self, (result) =>
    result._tag === "Success"
      ? Option.some(result.value)
      : Option.none())

/** @internal */
export const getCause: <E, A>(self: Result.Result<E, A>) => Cause.Cause<E> = (self) => {
  switch (self._tag) {
    case "Waiting":
      return getCause(self.previous)

    case "Failure":
      return self.cause

    case "Initial":
    case "Success": {
      return Cause.empty
    }
  }
}

/** @internal */
export const getExit: <E, A>(self: Result.Result<E, A>) => Exit.Exit<E | Cause.NoSuchElementException, A> = (self) => {
  switch (self._tag) {
    case "Waiting":
      return getExit(self.previous)

    case "Success":
      return Exit.succeed(self.value)

    case "Failure":
      return Exit.failCause(self.cause)

    case "Initial":
      return Exit.fail(Cause.NoSuchElementException("Result is in its initial state"))
  }
}

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

/** @internal */
const inspect = Symbol.for("nodejs.util.inspect.custom")

/** @internal */
const equals = (self: Result.Result<any, any>, that: unknown) => {
  if (!isResult(that)) return false
  if (self._tag === that._tag) return Equal.equals(self.i0, that.i0)
  const exits = [getExit(self), getExit(that)] as const
  return Equal.equals(...exits)
}

class Initial<E = never, A = never> implements Result.Initial<E, A> {
  readonly _tag = "Initial"
  readonly i0 = undefined as never
  readonly i1: undefined
  readonly i2: undefined;
  [Hash.symbol]() {
    return Hash.string(this._tag)
  }
  [Equal.symbol](this: this, that: Equal.Equal): boolean {
    return equals(this, that)
  }
  toString() {
    return "Initial"
  }
  toJSON() {
    return { _tag: this._tag }
  }
  [inspect]() {
    return this.toJSON()
  }
  pipe() {
    return pipeArguments(this, arguments)
  }
}

class Failure<E, A> implements Result.Failure<E, A> {
  readonly _tag = "Failure"
  readonly i1: undefined
  readonly i2: undefined
  constructor(readonly i0: Cause.Cause<E>) {}
  get cause() {
    return this.i0
  }
  [Hash.symbol]() {
    return Hash.combine(Hash.string(this._tag))(Hash.hash(this.i0))
  }
  [Equal.symbol](this: this, that: Equal.Equal): boolean {
    return equals(this, that)
  }
  toString() {
    return `Failure(${this.i0})`
  }
  toJSON() {
    return { _tag: this._tag, cause: this.i0 }
  }
  [inspect]() {
    return this.toJSON()
  }
  pipe() {
    return pipeArguments(this, arguments)
  }
}

class Success<E, A> implements Result.Success<E, A> {
  readonly _tag = "Success"
  readonly i1: undefined
  readonly i2: undefined
  constructor(readonly i0: A) {}
  get value() {
    return this.i0
  }
  [Hash.symbol]() {
    return Hash.combine(Hash.string(this._tag))(Hash.hash(this.i0))
  }
  [Equal.symbol](this: this, that: Equal.Equal): boolean {
    return equals(this, that)
  }
  toString() {
    return `Success(${this.i0})`
  }
  toJSON() {
    return { _tag: this._tag, value: this.i0 }
  }
  [inspect]() {
    return this.toJSON()
  }
  pipe() {
    return pipeArguments(this, arguments)
  }
}

class Waiting<E, A> implements Result.Waiting<Result.Result<E, A>> {
  readonly _tag = "Waiting"
  readonly i1: undefined
  readonly i2: undefined
  constructor(readonly i0: Result.Result<E, A>) {}
  get previous() {
    return this.i0
  }
  [Hash.symbol]() {
    return Hash.hash(this.i0)
  }
  [Equal.symbol](this: this, that: Equal.Equal): boolean {
    return equals(this, that)
  }
  toString() {
    return `Waiting(${this.i0})`
  }
  toJSON() {
    return { _tag: this._tag, previous: this.i0 }
  }
  [inspect]() {
    return this.toJSON()
  }
  pipe() {
    return pipeArguments(this, arguments)
  }
}

/** @internal */
export const empty = new Initial()

/** @internal */
export const initial = (): Result.Result<never, never> => empty

/** @internal */
export const success = <A>(value: A): Result.Result<never, A> => new Success(value)

/** @internal */
export const fail = <E>(failure: E): Result.Result<E, never> => failCause(Cause.fail(failure))

/** @internal */
export const failCause = <E>(cause: Cause.Cause<E>): Result.Result<E, never> => new Failure(cause)

/** @internal */
export const waiting = <E, A>(previous: Result.Result<E, A>): Result.Result<E, A> => new Waiting(previous)

/** @internal */
export const fromExit = <E, A>(
  exit: Exit.Exit<E, A>
): Result.Result<E, A> => {
  if (Exit.isFailure(exit)) {
    return failCause(exit.cause)
  }
  return success(exit.value)
}

// -----------------------------------------------------------------------------
// Refinements
// -----------------------------------------------------------------------------

/** @internal */
export const isResult = (u: unknown): u is Result.Result<unknown, unknown> =>
  typeof u === "object" && u != null && Equal.isEqual(u) && "_tag" in u

/** @internal */
export const isInitial = <E, A>(self: Result.Result<E, A>): self is Result.Initial<E, A> => self._tag === "Initial"

/** @internal */
export const isWaiting = <E, A>(
  self: Result.Result<E, A>
): self is Result.Waiting<Result.Result<E, A>> => self._tag === "Waiting"

/** @internal */
export const isFailure = <E, A>(self: Result.Result<E, A>): self is Result.Failure<E, A> => self._tag === "Failure"

/** @internal */
export const isSuccess = <E, A>(self: Result.Result<E, A>): self is Result.Success<E, A> => self._tag === "Success"

/** @internal */
export const isLoading = <E, A>(
  self: Result.Result<E, A>
): self is Result.Waiting<Result.Initial<E, A>> => isWaiting(self) && isInitial(self.previous)

/** @internal */
export const isRefreshing = <E, A>(self: Result.Result<E, A>): self is Result.Waiting<Result.Success<E, A>> =>
  isWaiting(self) && isSuccess(self.previous)

/** @internal */
export const isRetrying = <E, A>(self: Result.Result<E, A>): self is Result.Waiting<Result.Failure<E, A>> =>
  isWaiting(self) && isFailure(self.previous)

// -----------------------------------------------------------------------------
// Finding
// -----------------------------------------------------------------------------

/** @internal */
export const find: {
  <E, A, Z>(
    pf: (result: Result.Result<E, A>) => Option.Option<Z>
  ): (result: Result.Result<E, A>) => Option.Option<Z>
  <E, A, Z>(
    self: Result.Result<E, A>,
    pf: (cause: Result.Result<E, A>) => Option.Option<Z>
  ): Option.Option<Z>
} = dual(2, <E, A, Z>(self: Result.Result<E, A>, pf: (cause: Result.Result<E, A>) => Option.Option<Z>) => {
  const option = pf(self)
  switch (option._tag) {
    case "None": {
      if (self._tag === "Waiting") {
        return find(self.previous, pf)
      }
      return option
    }
    case "Some": {
      return option
    }
  }
})

// -----------------------------------------------------------------------------
// Mapping
// -----------------------------------------------------------------------------

/** @internal */
export const as = dual<
  <A2>(value: A2) => <E, A>(self: Result.Result<E, A>) => Result.Result<E, A2>,
  <E, A, A2>(self: Result.Result<E, A>, value: A2) => Result.Result<E, A2>
>(2, (self, value) => map(self, () => value))

/** @internal */
export const map = dual<
  <A, A2>(f: (a: A) => A2) => <E>(self: Result.Result<E, A>) => Result.Result<E, A2>,
  <E, A, A2>(self: Result.Result<E, A>, f: (a: A) => A2) => Result.Result<E, A2>
>(2, (self, f) => flatMap(self, (e) => success(f(e))))

// -----------------------------------------------------------------------------
// Sequencing
// -----------------------------------------------------------------------------

/** @internal */
export const flatMap: {
  <A, E2, A2>(
    f: (a: A) => Result.Result<E2, A2>
  ): <E>(self: Result.Result<E, A>) => Result.Result<E2 | E, A2>
  <E, A, E2, A2>(
    self: Result.Result<E, A>,
    f: (a: A) => Result.Result<E2, A2>
  ): Result.Result<E | E2, A2>
} = dual<
  <A, E2, A2>(
    f: (a: A) => Result.Result<E2, A2>
  ) => <E>(self: Result.Result<E, A>) => Result.Result<E | E2, A2>,
  <E, A, E2, A2>(
    self: Result.Result<E, A>,
    f: (a: A) => Result.Result<E2, A2>
  ) => Result.Result<E | E2, A2>
>(2, (self, f) =>
  match(self, {
    onInitial: empty,
    onFail: (error) => failCause(error),
    onSuccess: (a) => f(a) as any,
    // I wonder when this becomes a bug
    onWaiting: (previous) => previous._tag === "Waiting" ? flatMap(previous, f) : waiting(flatMap(previous, f))
  }))

/** @internal */
export const flatten = <E, E1, A>(
  self: Result.Result<E, Result.Result<E1, A>>
): Result.Result<E | E1, A> => flatMap(self, identity)

// -----------------------------------------------------------------------------
// Reducing
// -----------------------------------------------------------------------------

/** @internal */
export const match = dual<
  <Z, E, A>(
    options: {
      readonly onInitial: Z
      readonly onFail: (error: Cause.Cause<E>) => Z
      readonly onWaiting: (previous: Result.Result<E, A>) => Z
      readonly onSuccess: (value: A) => Z
    }
  ) => (self: Result.Result<E, A>) => Z,
  <Z, E, A>(
    self: Result.Result<E, A>,
    options: {
      readonly onInitial: Z
      readonly onFail: (error: Cause.Cause<E>) => Z
      readonly onWaiting: (previous: Result.Result<E, A>) => Z
      readonly onSuccess: (value: A) => Z
    }
  ) => Z
>(2, (self, { onFail, onInitial, onSuccess, onWaiting }) => {
  switch (self._tag) {
    case "Failure":
      return onFail(self.cause)

    case "Waiting":
      return onWaiting(self.previous)

    case "Success":
      return onSuccess(self.value)

    case "Initial":
      return onInitial
  }

  throw absurd(self)
})
