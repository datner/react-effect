import * as Context from "@effect/data/Context"
import * as Effect from "@effect/io/Effect"
import * as Layer from "@effect/io/Layer"
import * as Stream from "@effect/stream/Stream"
import { renderHook, waitFor } from "@testing-library/react"
import * as Result from "react-effect/Result"
import * as RuntimeProvider from "react-effect/RuntimeProvider"
import { describe, expect, it } from "vitest"

interface Foo {
  value: number
}
const foo = Context.Tag<Foo>()

const { useResult } = RuntimeProvider.makeFromLayer(Layer.succeed(foo, { value: 1 }))

describe("useResult", () => {
  it("should run effects", async () => {
    const testEffect = Effect.succeed(1)

    const { result } = await waitFor(async () => renderHook(() => useResult(testEffect)))

    expect(Result.isSuccess(result.current.result)).toBe(true)
  })

  it("should provide context", async () => {
    const testEffect = Effect.map(foo, (_) => _.value)

    const { result } = await waitFor(async () => renderHook(() => useResult(testEffect)))

    await waitFor(() => expect(Result.isSuccess(result.current.result)).toBe(true))
    expect(result.current.result.value).toBe(1)
  })

  it("should run streams", async () => {
    const testEffect = Stream.succeed(1)

    const { result } = await waitFor(async () => renderHook(() => useResult(testEffect)))

    await waitFor(() => expect(Result.isSuccess(result.current.result)).toBe(true))
  })
})
