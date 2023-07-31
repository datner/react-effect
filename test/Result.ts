import * as E from "@effect/data/Either"
import * as Equal from "@effect/data/Equal"
import * as O from "@effect/data/Option"
import * as S from "@effect/data/String"
import * as Cause from "@effect/io/Cause"
import * as Exit from "@effect/io/Exit"
import * as fc from "fast-check"
import * as Result from "react-effect/Result"
import { result } from "react-effect/test/utils/result"
import { inspect } from "util"
import { assert, describe, it } from "vitest"

describe("Result", () => {
  it("should export", () => {
    assert.exists(Result.TypeId)
  })

  it("should be compared for equality by value", () => {
    assert.isTrue(Equal.equals(Result.defect(Cause.fail(1)), Result.defect(Cause.fail(1))))
    assert.isFalse(Equal.equals(Result.defect(Cause.empty), Result.defect(Cause.die(1))))
    assert.isTrue(Equal.equals(Result.fail(1), Result.fail(1)))
    assert.isFalse(Equal.equals(Result.fail(1), Result.fail(2)))
    assert.isTrue(Equal.equals(Result.success(1), Result.success(1)))
    assert.isFalse(Equal.equals(Result.success(1), Result.success(2)))
    assert.isTrue(Equal.equals(Result.waiting(Result.success(1)), Result.waiting(Result.success(1))))
    assert.isFalse(Equal.equals(Result.waiting(Result.success(1)), Result.waiting(Result.success(2))))
    assert.isTrue(Equal.equals(Result.waiting(Result.success(1)), Result.success(1)))
  })

  it("`Result.equals` is symmetric", () => {
    fc.assert(
      fc.property(result, result, (resultA, resultB) => {
        assert.strictEqual(
          Equal.equals(resultA, resultB),
          Equal.equals(resultB, resultA)
        )
      })
    )
  })

  describe("JS Conventions", () => {
    it("toString", () => {
      assert.strictEqual(Result.init.toString(), "initial()")
      assert.strictEqual(Result.fail(1).toString(), "failure(1)")
      assert.strictEqual(Result.success(1).toString(), "success(1)")
      // I'm not checking if Cause toString correctly, only if Result does.
      assert.strictEqual(Result.defect(Cause.empty).toString(), `defect(${Cause.empty})`)
      assert.strictEqual(Result.waiting(Result.success(1)).toString(), "waiting(success(1))")
    })

    it("toJSON", () => {
      assert.strictEqual(JSON.stringify(Result.init), JSON.stringify({ _tag: "Initial" }))
      assert.strictEqual(JSON.stringify(Result.fail(1)), JSON.stringify({ _tag: "Fail", error: 1 }))
      assert.strictEqual(
        JSON.stringify(Result.defect(Cause.empty)),
        JSON.stringify({ _tag: "Defect", cause: Cause.empty })
      )
      assert.strictEqual(JSON.stringify(Result.success(1)), JSON.stringify({ _tag: "Success", value: 1 }))
      assert.strictEqual(
        JSON.stringify(Result.waiting(Result.success(1))),
        JSON.stringify({ _tag: "Waiting", previous: Result.success(1) })
      )
    })

    it("inspect", () => {
      assert.strictEqual(inspect(Result.init), inspect({ _tag: "Initial" }))
      assert.strictEqual(inspect(Result.fail(1)), inspect({ _tag: "Fail", error: 1 }))
      assert.strictEqual(
        inspect(Result.defect(Cause.empty)),
        inspect({ _tag: "Defect", cause: Cause.empty })
      )
      assert.strictEqual(inspect(Result.success(1)), inspect({ _tag: "Success", value: 1 }))
      assert.strictEqual(
        inspect(Result.waiting(Result.success(1))),
        inspect({ _tag: "Waiting", previous: Result.success(1) })
      )
    })
  })

  describe("mapping", () => {
    it("map", () => {
      const f = Result.map(S.length)
      assert.deepStrictEqual(f(Result.success("abc")), Result.success(3))
      assert.deepStrictEqual(f(Result.fail("abc")), Result.fail("abc"))
      assert.deepStrictEqual(f(Result.defect(Cause.empty)), Result.defect(Cause.empty))
      assert.deepStrictEqual(f(Result.init), Result.init)
      assert.deepStrictEqual(f(Result.waiting(Result.success("abc"))), Result.waiting(Result.success(3)))
    })

    it("as", () => {
      const f = Result.as(0)
      assert.deepStrictEqual(f(Result.success("abc")), Result.success(0))
      assert.deepStrictEqual(f(Result.fail("abc")), Result.fail("abc"))
      assert.deepStrictEqual(f(Result.defect(Cause.empty)), Result.defect(Cause.empty))
      assert.deepStrictEqual(f(Result.init), Result.init)
      assert.deepStrictEqual(f(Result.waiting(Result.success("abc"))), Result.waiting(Result.success(0)))
    })
  })

  describe("transforming", () => {
    it("flatMap", () => {
      const f = Result.flatMap((_: number) => Result.success(_ * 2))
      assert.deepStrictEqual(f(Result.success(2)), Result.success(4))
      assert.deepStrictEqual(f(Result.fail("abc")), Result.fail("abc"))
      assert.deepStrictEqual(f(Result.defect(Cause.empty)), Result.defect(Cause.empty))
      assert.deepStrictEqual(f(Result.init), Result.init)
      assert.deepStrictEqual(f(Result.waiting(Result.success(2))), Result.waiting(Result.success(4)))
    })

    it("flatten", () => {
      const f = Result.flatten
      assert.deepStrictEqual(f(Result.success(Result.success(1))), Result.success(1))
      assert.deepStrictEqual(f(Result.fail("abc")), Result.fail("abc"))
      assert.deepStrictEqual(f(Result.defect(Cause.empty)), Result.defect(Cause.empty))
      assert.deepStrictEqual(f(Result.init), Result.init)
      assert.deepStrictEqual(f(Result.waiting(Result.success(Result.success(1)))), Result.waiting(Result.success(1)))
    })
  })

  describe("refinements", () => {
    it("isResult", () => {
      fc.assert(
        fc.property(fc.anything(), (_) => {
          assert.isFalse(Result.isResult(_))
        })
      )
      fc.assert(
        fc.property(result, (_) => {
          assert.isTrue(Result.isResult(_))
        })
      )
    })

    it("isInitial", () => {
      assert.isTrue(Result.isInitial(Result.init))
      assert.isFalse(Result.isInitial(Result.waiting(Result.init)))
      assert.isFalse(Result.isInitial(Result.fail(1)))
      assert.isFalse(Result.isInitial(Result.defect(Cause.empty)))
      assert.isFalse(Result.isInitial(Result.success(1)))
      assert.isFalse(Result.isInitial(Result.waiting(Result.success(1))))
    })

    it("isSuccess", () => {
      assert.isFalse(Result.isSuccess(Result.init))
      assert.isFalse(Result.isSuccess(Result.waiting(Result.init)))
      assert.isFalse(Result.isSuccess(Result.fail(1)))
      assert.isFalse(Result.isSuccess(Result.defect(Cause.empty)))
      assert.isTrue(Result.isSuccess(Result.success(1)))
      assert.isFalse(Result.isSuccess(Result.waiting(Result.success(1))))
    })

    it("isFail", () => {
      assert.isFalse(Result.isFail(Result.init))
      assert.isFalse(Result.isFail(Result.waiting(Result.init)))
      assert.isTrue(Result.isFail(Result.fail(1)))
      assert.isFalse(Result.isFail(Result.defect(Cause.empty)))
      assert.isFalse(Result.isFail(Result.success(1)))
      assert.isFalse(Result.isFail(Result.waiting(Result.success(1))))
    })

    it("isDefect", () => {
      assert.isFalse(Result.isDefect(Result.init))
      assert.isFalse(Result.isDefect(Result.waiting(Result.init)))
      assert.isFalse(Result.isDefect(Result.fail(1)))
      assert.isTrue(Result.isDefect(Result.defect(Cause.empty)))
      assert.isFalse(Result.isDefect(Result.success(1)))
      assert.isFalse(Result.isDefect(Result.waiting(Result.success(1))))
    })

    it("isError", () => {
      assert.isFalse(Result.isError(Result.init))
      assert.isFalse(Result.isError(Result.waiting(Result.init)))
      assert.isTrue(Result.isError(Result.fail(1)))
      assert.isTrue(Result.isError(Result.defect(Cause.empty)))
      assert.isFalse(Result.isError(Result.success(1)))
      assert.isFalse(Result.isError(Result.waiting(Result.success(1))))
    })

    it("isLoading", () => {
      assert.isFalse(Result.isLoading(Result.init))
      assert.isTrue(Result.isLoading(Result.waiting(Result.init)))
      assert.isFalse(Result.isLoading(Result.fail(1)))
      assert.isFalse(Result.isLoading(Result.defect(Cause.empty)))
      assert.isFalse(Result.isLoading(Result.success(1)))
      assert.isFalse(Result.isLoading(Result.waiting(Result.success(1))))
      assert.isFalse(Result.isLoading(Result.waiting(Result.fail(1))))
      assert.isFalse(Result.isRetrying(Result.waiting(Result.defect(Cause.empty))))
    })

    it("isRetrying", () => {
      assert.isFalse(Result.isRetrying(Result.init))
      assert.isFalse(Result.isRetrying(Result.waiting(Result.init)))
      assert.isFalse(Result.isRetrying(Result.fail(1)))
      assert.isFalse(Result.isRetrying(Result.defect(Cause.empty)))
      assert.isFalse(Result.isRetrying(Result.success(1)))
      assert.isFalse(Result.isRetrying(Result.waiting(Result.success(1))))
      assert.isTrue(Result.isRetrying(Result.waiting(Result.fail(1))))
      assert.isFalse(Result.isRetrying(Result.waiting(Result.defect(Cause.empty))))
    })

    it("isRefreshing", () => {
      assert.isFalse(Result.isRefreshing(Result.init))
      assert.isFalse(Result.isRefreshing(Result.waiting(Result.init)))
      assert.isFalse(Result.isRefreshing(Result.fail(1)))
      assert.isFalse(Result.isRefreshing(Result.defect(Cause.empty)))
      assert.isFalse(Result.isRefreshing(Result.success(1)))
      assert.isTrue(Result.isRefreshing(Result.waiting(Result.success(1))))
      assert.isFalse(Result.isRefreshing(Result.waiting(Result.fail(1))))
      assert.isFalse(Result.isRefreshing(Result.waiting(Result.defect(Cause.empty))))
    })
  })

  describe("getters", () => {
    it("getValue", () => {
      assert.deepStrictEqual(Result.getValue(Result.success(1)), O.some(1))
      assert.deepStrictEqual(Result.getValue(Result.fail(1)), O.none())
      assert.deepStrictEqual(Result.getValue(Result.defect(Cause.fail(1))), O.none())
      assert.deepStrictEqual(Result.getValue(Result.waiting(Result.success(1))), O.some(1))
      assert.deepStrictEqual(Result.getValue(Result.waiting(Result.fail(1))), O.none())
      assert.deepStrictEqual(Result.getValue(Result.waiting(Result.defect(Cause.fail(1)))), O.none())
    })

    it("getFailure", () => {
      assert.deepStrictEqual(Result.getFailure(Result.success(1)), O.none())
      assert.deepStrictEqual(Result.getFailure(Result.fail(1)), O.some(1))
      assert.deepStrictEqual(Result.getFailure(Result.defect(Cause.fail(1))), O.none())
      assert.deepStrictEqual(Result.getFailure(Result.waiting(Result.success(1))), O.none())
      assert.deepStrictEqual(Result.getFailure(Result.waiting(Result.fail(1))), O.some(1))
      assert.deepStrictEqual(Result.getFailure(Result.waiting(Result.defect(Cause.fail(1)))), O.none())
    })

    it("getDefect", () => {
      assert.deepStrictEqual(Result.getDefect(Result.success(1)), O.none())
      assert.deepStrictEqual(Result.getDefect(Result.fail(1)), O.none())
      assert.deepStrictEqual(Result.getDefect(Result.defect(Cause.fail(1))), O.some(Cause.fail(1)))
      assert.deepStrictEqual(Result.getDefect(Result.waiting(Result.success(1))), O.none())
      assert.deepStrictEqual(Result.getDefect(Result.waiting(Result.fail(1))), O.none())
      assert.deepStrictEqual(Result.getDefect(Result.waiting(Result.defect(Cause.fail(1)))), O.some(Cause.fail(1)))
    })

    it("getExit", () => {
      assert.deepStrictEqual(Result.getExit(Result.success(1)), Exit.succeed(E.right(1)))
      assert.deepStrictEqual(Result.getExit(Result.fail(1)), Exit.succeed(E.left(1)))
      assert.deepStrictEqual(Result.getExit(Result.defect(Cause.fail(1))), Exit.fail(1))
      assert.deepStrictEqual(Result.getExit(Result.waiting(Result.success(1))), Exit.succeed(E.right(1)))
      assert.deepStrictEqual(Result.getExit(Result.waiting(Result.fail(1))), Exit.succeed(E.left(1)))
      assert.deepStrictEqual(Result.getExit(Result.waiting(Result.defect(Cause.fail(1)))), Exit.fail(1))
    })
  })

  describe("constructors", () => {
    it("fromExitEither", () => {
      assert.deepStrictEqual(Result.fromExitEither(Exit.succeed(E.right(1))), Result.success(1))
      assert.deepStrictEqual(Result.fromExitEither(Exit.succeed(E.left(1))), Result.fail(1))
      assert.deepStrictEqual(Result.fromExitEither(Exit.fail(1)), Result.defect(Cause.fail(1)))
    })
  })
})
