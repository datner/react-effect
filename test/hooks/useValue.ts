import * as Context from "@effect/data/Context"
import * as Effect from "@effect/io/Effect"
import * as Layer from "@effect/io/Layer"
import * as Stream from "@effect/stream/Stream"
import { renderHook, waitFor } from "@testing-library/react"
import * as RuntimeProvider from "effect-react/RuntimeProvider"
import { describe, expect, it } from "vitest"

interface Foo {
  value: number
}
const foo = Context.Tag<Foo>()

const { useValue } = RuntimeProvider.makeFromLayer(Layer.succeed(foo, { value: 1 }))

describe("useValue", () => {
  it("should run effects", async () => {
    const testEffect = Effect.succeed(1)
    const { result } = renderHook(() => useValue(testEffect, 0, []))
    expect(result.current).toBe(0)
    await waitFor(() => expect(result.current).toBe(1))
  })

  it("should provide context", async () => {
    const testEffect = Effect.map(foo, (_) => _.value)
    const { result } = renderHook(() => useValue(testEffect, 0, []))
    expect(result.current).toBe(0)
    await waitFor(() => expect(result.current).toBe(1))
  })

  it("should run streams", async () => {
    const testStream = Stream.succeed(1)
    const { result } = renderHook(() => useValue(testStream, 0, []))
    expect(result.current).toBe(0)
    await waitFor(() => expect(result.current).toBe(1))
  })
})
