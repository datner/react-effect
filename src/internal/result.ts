import type * as Data from "@effect/data/Data"
import * as Either from "@effect/data/Either"
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
// Constructors
// -----------------------------------------------------------------------------

/** @internal */
export class Initial implements Result.Initial {
  readonly _tag = "Initial"
  readonly _id: typeof TypeId = TypeId
  public i0 = undefined
  public i1 = undefined
  public i2 = undefined;
  [Equal.symbol](this: this, that: unknown) {
    if (!isResult(that)) return false
    if (isWaiting(that)) {
      return Equal.equals(that, this)
    }
    return isInitial(that)
  }
  [Hash.symbol](this: this) {
    return Hash.hash(this.i0)
  }
  get [TypeId]() {
    return {
      _D: (_: never) => _,
      _E: (_: never) => _,
      _A: (_: never) => _
    }
  }
  toString() {
    return `initial()`
  }
  toJSON() {
    return {
      _tag: this._tag
    }
  }
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return this.toJSON()
  }
  pipe() {
    return pipeArguments(this, arguments)
  }
}

/** @internal */
export class Waiting<Previous extends Result.CurrentResult<any, any, any>> implements Result.Waiting<Previous> {
  readonly _tag = "Waiting"
  readonly _id: typeof TypeId = TypeId
  public i1 = undefined
  public i2 = undefined
  constructor(readonly i0: Previous) {}
  [Equal.symbol](this: this, that: unknown) {
    return isResult(that) && (isWaiting(that) ?
      Equal.equals(this.i0, (that as unknown as Waiting<Previous>).i0) :
      Equal.equals(this.i0, that))
  }
  [Hash.symbol](this: this) {
    return Hash.hash(this.i0)
  }
  get previous() {
    return this.i0
  }
  get [TypeId]() {
    return {
      _D: (_: never) => _,
      _E: (_: never) => _,
      _A: (_: never) => _
    }
  }
  toString() {
    return `waiting(${String(this.i0)})`
  }
  toJSON() {
    return {
      _tag: this._tag,
      previous: this.i0
    }
  }
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return this.toJSON()
  }
  pipe() {
    return pipeArguments(this, arguments)
  }
}

/** @internal */
export class Fail<E> implements Result.Fail<E> {
  readonly _tag = "Fail"
  readonly _id: typeof TypeId = TypeId
  public i1 = undefined
  public i2 = undefined
  constructor(readonly i0: E) {}
  [Equal.symbol](this: this, that: unknown) {
    if (!isResult(that)) return false
    if (isFail(that)) {
      return Equal.equals((that as unknown as Fail<E>).i0, this.i0)
    }
    if (isWaiting(that)) {
      return Equal.equals(that, this)
    }
    return false
  }
  [Hash.symbol](this: this) {
    return Hash.hash(this.i0)
  }
  get error() {
    return this.i0
  }
  get [TypeId]() {
    return {
      _D: (_: never) => _,
      _E: (_: never) => _,
      _A: (_: never) => _
    }
  }
  toString() {
    return `failure(${String(this.i0)})`
  }
  toJSON() {
    return {
      _tag: this._tag,
      error: this.i0
    }
  }
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return this.toJSON()
  }
  pipe() {
    return pipeArguments(this, arguments)
  }
}

/** @internal */
export class Defect<D> implements Result.Defect<D> {
  readonly _tag = "Defect"
  readonly _id: typeof TypeId = TypeId
  public i1 = undefined
  public i2 = undefined
  constructor(readonly i0: Cause.Cause<D>) {}
  [Equal.symbol](this: this, that: unknown) {
    if (!isResult(that)) return false
    if (isDefect(that)) {
      return Equal.equals((that as unknown as Defect<D>).i0, this.i0)
    }
    if (isWaiting(that)) {
      return Equal.equals(that, this)
    }
    return false
  }
  [Hash.symbol](this: this) {
    return Hash.hash(this.i0)
  }
  get cause() {
    return this.i0
  }
  get [TypeId]() {
    return {
      _D: (_: never) => _,
      _E: (_: never) => _,
      _A: (_: never) => _
    }
  }
  toString() {
    return `defect(${String(this.i0)})`
  }
  toJSON() {
    return {
      _tag: this._tag,
      cause: this.i0
    }
  }
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return this.toJSON()
  }
  pipe() {
    return pipeArguments(this, arguments)
  }
}

/** @internal */
export class Success<A> implements Result.Success<A> {
  readonly _tag = "Success"
  readonly _id: typeof TypeId = TypeId
  public i1 = undefined
  public i2 = undefined
  constructor(readonly i0: A) {}
  [Equal.symbol](this: this, that: unknown) {
    if (!isResult(that)) return false
    if (isSuccess(that)) {
      return Equal.equals((that as unknown as Success<A>).i0, this.i0)
    }
    if (isWaiting(that)) {
      return Equal.equals(that, this)
    }
    return false
  }
  [Hash.symbol](this: this) {
    return Hash.hash(this.i0)
  }
  get value() {
    return this.i0
  }
  get [TypeId]() {
    return {
      _D: (_: never) => _,
      _E: (_: never) => _,
      _A: (_: never) => _
    }
  }
  toString() {
    return `success(${String(this.i0)})`
  }
  toJSON() {
    return {
      _tag: this._tag,
      value: this.i0
    }
  }
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return this.toJSON()
  }
  pipe() {
    return pipeArguments(this, arguments)
  }
}

/** @internal */
export const init: Result.Result<never, never, never> = (() => new Initial())()

/** @internal */
export const fail = <E>(e: E): Result.Result<never, E, never> => new Fail(e)

/** @internal */
export const defect = <D>(d: Cause.Cause<D>): Result.Result<D, never, never> => new Defect(d)

/** @internal */
export const waiting = <D, E, A>(previous: Result.Result<D, E, A>): Result.Result<D, E, A> =>
  previous._tag === "Waiting" ? previous : new Waiting(previous)

/** @internal */
export const success = <A>(a: A): Result.Result<never, never, A> => new Success(a)

/** @internal */
export const fromExitEither = <D, E, A>(
  exit: Exit.Exit<D, Either.Either<E, A>>
): Result.Result<D, E, A> => {
  if (Exit.isFailure(exit)) {
    return defect(exit.cause)
  }
  if (Either.isLeft(exit.value)) {
    return fail(exit.value.left)
  }
  return success(exit.value.right)
}

// -----------------------------------------------------------------------------
// Refinements
// -----------------------------------------------------------------------------

/** @internal */
export const isResult = (u: unknown): u is Result.Result<unknown, unknown, unknown> =>
  typeof u === "object" && u != null && TypeId in u && Equal.isEqual(u)

/** @internal */
export const isInitial = <D, E, A>(self: Result.Result<D, E, A>): self is Result.Initial => self._tag === "Initial"

/** @internal */
export const isWaiting = <D, E, A>(
  self: Result.Result<D, E, A>
): self is Result.Waiting<Result.CurrentResult<D, E, A>> => self._tag === "Waiting"

/** @internal */
export const isFail = <D, E, A>(self: Result.Result<D, E, A>): self is Result.Fail<E> => self._tag === "Fail"

/** @internal */
export const isDefect = <D, E, A>(self: Result.Result<D, E, A>): self is Result.Defect<D> => self._tag === "Defect"

/** @internal */
export const isSuccess = <D, E, A>(self: Result.Result<D, E, A>): self is Result.Success<A> => self._tag === "Success"

/** @internal */
export const isError = <D, E, A>(self: Result.Result<D, E, A>): self is Result.Defect<D> | Result.Fail<E> =>
  isFail(self) || isDefect(self)

/** @internal */
export const isLoading = <D, E, A>(
  self: Result.Result<D, E, A>
): self is Result.Waiting<Result.Initial> => isWaiting(self) && isInitial(self.previous)

/** @internal */
export const isRefreshing = <D, E, A>(self: Result.Result<D, E, A>): self is Result.Waiting<Result.Success<A>> =>
  isWaiting(self) && isSuccess(self.previous)

/** @internal */
export const isRetrying = <D, E, A>(self: Result.Result<D, E, A>): self is Result.Waiting<Result.Fail<E>> =>
  isWaiting(self) && isFail(self.previous)

// -----------------------------------------------------------------------------
// Getters
// -----------------------------------------------------------------------------

/** @internal */
export const getFailure = <D, E, A>(self: Result.Result<D, E, A>): Option.Option<E> =>
  find<D, E, A, E>(self, (result) =>
    result._tag === "Fail"
      ? Option.some(result.error)
      : Option.none())

/** @internal */
export const getDefect = <D, E, A>(self: Result.Result<D, E, A>): Option.Option<Cause.Cause<D>> =>
  find<D, E, A, Cause.Cause<D>>(self, (result) =>
    result._tag === "Defect"
      ? Option.some(result.cause)
      : Option.none())

/** @internal */
export const getValue = <D, E, A>(self: Result.Result<D, E, A>): Option.Option<A> =>
  find<D, E, A, A>(self, (result) =>
    result._tag === "Success"
      ? Option.some(result.value)
      : Option.none())

/** @internal */
export const getCause: <D, E, A>(self: Result.Result<D, E, A>) => Cause.Cause<D | E> = (self) => {
  switch (self._tag) {
    case "Waiting":
      return getCause(self.previous)

    case "Defect":
      return self.cause

    case "Fail":
      return Cause.fail(self.error)

    case "Initial":
    case "Success": {
      return Cause.empty
    }
  }
}

/** @internal */
export const getExit: <D, E, A>(self: Result.Result<D, E, A>) => Exit.Exit<D, Either.Either<E, A>> = (self) => {
  switch (self._tag) {
    case "Waiting":
      return getExit(self.previous)

    case "Defect":
      return Exit.failCause(self.cause)

    case "Fail":
      return Exit.succeed(Either.left(self.error))

    case "Success":
      return Exit.succeed(Either.right(self.value))

    case "Initial":
      return Exit.failCause(Cause.empty)
  }
}

// -----------------------------------------------------------------------------
// Finding
// -----------------------------------------------------------------------------

/** @internal */
export const find: {
  <D, E, A, Z>(
    pf: (result: Result.Result<D, E, A>) => Option.Option<Z>
  ): (result: Result.Result<D, E, A>) => Option.Option<Z>
  <D, E, A, Z>(
    self: Result.Result<D, E, A>,
    pf: (cause: Result.Result<D, E, A>) => Option.Option<Z>
  ): Option.Option<Z>
} = dual(2, <D, E, A, Z>(self: Result.Result<D, E, A>, pf: (cause: Result.Result<D, E, A>) => Option.Option<Z>) => {
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
  <A2>(value: A2) => <D, E, A>(self: Result.Result<D, E, A>) => Result.Result<D, E, A2>,
  <D, E, A, A2>(self: Result.Result<D, E, A>, value: A2) => Result.Result<D, E, A2>
>(2, (self, error) => map(self, () => error))

/** @internal */
export const map = dual<
  <A, A2>(f: (a: A) => A2) => <D, E>(self: Result.Result<D, E, A>) => Result.Result<D, E, A2>,
  <D, E, A, A2>(self: Result.Result<D, E, A>, f: (a: A) => A2) => Result.Result<D, E, A2>
>(2, (self, f) => flatMap(self, (e) => success(f(e))))

// -----------------------------------------------------------------------------
// Sequencing
// -----------------------------------------------------------------------------

/** @internal */
export const flatMap: {
  <A, D2, E2, A2>(
    f: (a: A) => Result.Result<D2, E2, A2>
  ): <D, E>(self: Result.Result<D, E, A>) => Result.Result<D2 | D, E2 | E, A2>
  <D, E, A, D2, E2, A2>(
    self: Result.Result<D, E, A>,
    f: (a: A) => Result.Result<D2, E2, A2>
  ): Result.Result<D | D2, E | E2, A2>
} = dual<
  <A, D2, E2, A2>(
    f: (a: A) => Result.Result<D2, E2, A2>
  ) => <D, E>(self: Result.Result<D, E, A>) => Result.Result<D | D2, E | E2, A2>,
  <D, E, A, D2, E2, A2>(
    self: Result.Result<D, E, A>,
    f: (a: A) => Result.Result<D2, E2, A2>
  ) => Result.Result<D | D2, E | E2, A2>
>(2, (self, f) =>
  match(self, {
    onInitial: init,
    onFail: (error) => fail(error),
    onSuccess: (a) => f(a) as any,
    onWaiting: (previous) => waiting(flatMap(previous, f)),
    onDefect: (cause) => defect(cause)
  }))

/** @internal */
export const flatten = <D, E, D1, E1, A>(
  self: Result.Result<D, E, Result.Result<D1, E1, A>>
): Result.Result<D | D1, E | E1, A> => flatMap(self, identity)

// -----------------------------------------------------------------------------
// Reducing
// -----------------------------------------------------------------------------

/** @internal */
export const match = dual<
  <Z, D, E, A>(
    options: {
      readonly onInitial: Z
      readonly onFail: (error: E) => Z
      readonly onDefect: (defect: Cause.Cause<D>) => Z
      readonly onWaiting: (previous: Result.Result<D, E, A>) => Z
      readonly onSuccess: (value: A) => Z
    }
  ) => (self: Result.Result<D, E, A>) => Z,
  <Z, D, E, A>(
    self: Result.Result<D, E, A>,
    options: {
      readonly onInitial: Z
      readonly onFail: (error: E) => Z
      readonly onDefect: (defect: Cause.Cause<D>) => Z
      readonly onWaiting: (previous: Result.Result<D, E, A>) => Z
      readonly onSuccess: (value: A) => Z
    }
  ) => Z
>(2, (self, { onDefect, onFail, onInitial, onSuccess, onWaiting }) => {
  switch (self._tag) {
    case "Fail":
      return onFail(self.error)

    case "Defect":
      return onDefect(self.cause)

    case "Waiting":
      return onWaiting(self.previous)

    case "Success":
      return onSuccess(self.value)

    case "Initial":
      return onInitial
  }

  throw absurd(self)
})
