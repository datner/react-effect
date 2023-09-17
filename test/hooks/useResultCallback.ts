import * as Context from "@effect/data/Context"
import * as Effect from "@effect/io/Effect"
import * as Layer from "@effect/io/Layer"
import { act, renderHook, waitFor } from "@testing-library/react"
import * as Result from "effect-react/Result"
import * as RuntimeProvider from "effect-react/RuntimeProvider"
import { describe, expect, it } from "vitest"

interface Foo {
  value: number
}
const foo = Context.Tag<Foo>()

const { useResultCallback } = RuntimeProvider.makeFromLayer(Layer.succeed(foo, { value: 1 }))

describe("useResultCallback", () => {
  it("should do good", async () => {
    const testEffect = (value: number) => Effect.succeed(value)

    const { result } = renderHook(() => useResultCallback(testEffect))

    assert.isTrue(Result.isInitial(result.current[0].result))
    act(() => {
      result.current[1](1)
    })
    await waitFor(() => {
      assert(Result.isSuccess(result.current[0].result))
      return expect(result.current[0].result.value).toBe(1)
    })
    act(() => {
      result.current[1](2)
    })
    await waitFor(() => {
      assert(Result.isSuccess(result.current[0].result))
      return expect(result.current[0].result.value).toBe(2)
    })
  })

  it("should do good async", async () => {
    const testEffect = (value: number) =>
      Effect.async<never, never, number>((cb) => {
        setTimeout(() => cb(Effect.succeed(value)), 100)
      })
    const { result } = renderHook(() => useResultCallback(testEffect))

    assert.isTrue(Result.isInitial(result.current[0].result))
    act(() => {
      result.current[1](1)
    })
    await waitFor(() => assert.isTrue(result.current[0].isLoading))
    await waitFor(() => {
      assert(Result.isSuccess(result.current[0].result))
      return expect(result.current[0].result.value).toBe(1)
    })
    act(() => {
      result.current[1](2)
    })
    await waitFor(() => assert.isTrue(result.current[0].isRefreshing))
    await waitFor(() => {
      assert(Result.isSuccess(result.current[0].result))
      return expect(result.current[0].result.value).toBe(2)
    })
  })
})
