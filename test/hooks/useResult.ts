import * as Context from "@effect/data/Context"
import * as Effect from "@effect/io/Effect"
import * as Layer from "@effect/io/Layer"
import * as Stream from "@effect/stream/Stream"
import { renderHook, waitFor } from "@testing-library/react"
import * as Result from "effect-react/Result"
import * as RuntimeProvider from "effect-react/RuntimeProvider"
import { describe, expect, it } from "vitest"

interface Foo {
  value: number
}
const foo = Context.Tag<Foo>()

const { useResult } = RuntimeProvider.makeFromLayer(Layer.succeed(foo, { value: 1 }))

describe("useResult", () => {
  it("should run effects", async () => {
    const testEffect = Effect.succeed(1)
    const { result } = renderHook(() => useResult(() => testEffect, []))
    expect(Result.isInitial(result.current.result)).toBe(true)
    await waitFor(() => expect(Result.isSuccess(result.current.result)).toBe(true))
  })

  it("should provide context", async () => {
    const testEffect = Effect.map(foo, (_) => _.value)
    const { result } = renderHook(() => useResult(() => testEffect, []))
    expect(Result.isInitial(result.current.result)).toBe(true)
    await waitFor(() => {
      assert(Result.isSuccess(result.current.result))
      return expect(result.current.result.value).toBe(1)
    })
  })

  it("should run streams", async () => {
    const testStream = Stream.succeed(1)
    const { result } = renderHook(() => useResult(() => testStream, []))
    expect(Result.isInitial(result.current.result)).toBe(true)
    await waitFor(() => {
      assert(Result.isSuccess(result.current.result))
      return expect(result.current.result.value).toBe(1)
    })
  })
})
