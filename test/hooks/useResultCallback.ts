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

describe("useResult", () => {
  it("should do good", async () => {
    const testEffect = (value: number) => Effect.succeed(value)

    const { result } = await waitFor(async () => renderHook(() => useResultCallback(testEffect)))

    expect(Result.isInitial(result.current[0].result)).toBe(true)
    act(() => {
      result.current[1](1)
    })
    await waitFor(() => expect(Result.isSuccess(result.current[0].result)).toBe(true))
    expect(result.current[0].result.value).toBe(1)
    act(() => {
      result.current[1](2)
    })
    await waitFor(() => expect(Result.isSuccess(result.current[0].result)).toBe(true))
    expect(result.current[0].result.value).toBe(2)
  })
})
