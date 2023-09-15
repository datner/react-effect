import * as Context from "@effect/data/Context"
import * as Effect from "@effect/io/Effect"
import * as Layer from "@effect/io/Layer"
import * as Stream from "@effect/stream/Stream"
import { renderHook, waitFor } from "@testing-library/react"
import * as Hooks from "effect-react/Hooks"
import * as Result from "effect-react/Result"
import * as RuntimeContext from "effect-react/RuntimeContext"
import { describe, expect, it } from "vitest"

interface Foo {
  value: number
}
const foo = Context.Tag<Foo>()

const context = RuntimeContext.fromLayer(Layer.succeed(foo, { value: 1 }))
const useResult = Hooks.makeUseResult(context)

describe("useResult", () => {
  it("should run effects", async () => {
    const testEffect = Effect.succeed(1)
    const { result } = await waitFor(async () => renderHook(() => useResult(() => testEffect, [])))
    expect(Result.isSuccess(result.current.result)).toBe(true)
  })

  it("override Provider value", async () => {
    const [Override] = RuntimeContext.overrideLayer(context, Layer.succeed(foo, { value: 2 }))
    const testEffect = Effect.map(foo, (_) => _.value)
    const { result } = await waitFor(async () =>
      renderHook(() => useResult(() => testEffect, []), {
        wrapper: Override
      })
    )
    await waitFor(() => expect(Result.isSuccess(result.current.result)).toBe(true))
    assert(Result.isSuccess(result.current.result))
    expect(result.current.result.value).toBe(2)
  })

  it("should provide context", async () => {
    const testEffect = Effect.map(foo, (_) => _.value)
    const { result } = await waitFor(async () => renderHook(() => useResult(() => testEffect, [])))
    await waitFor(() => expect(Result.isSuccess(result.current.result)).toBe(true))
    assert(Result.isSuccess(result.current.result))
    expect(result.current.result.value).toBe(1)
  })

  it("should run streams", async () => {
    const testStream = Stream.succeed(1)
    const { result } = await waitFor(async () => renderHook(() => useResult(() => testStream, [])))
    await waitFor(() => expect(Result.isSuccess(result.current.result)).toBe(true))
    assert(Result.isSuccess(result.current.result))
    expect(result.current.result.value).toBe(1)
  })
})
