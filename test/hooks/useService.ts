import * as Context from "@effect/data/Context"
import * as Layer from "@effect/io/Layer"
import { renderHook } from "@testing-library/react"
import * as RuntimeProvider from "effect-react/RuntimeProvider"
import { describe, expect, it } from "vitest"

interface Foo {
  value: number
}
const foo = Context.Tag<Foo>()

const { useService } = RuntimeProvider.makeFromLayer(Layer.succeed(foo, { value: 1 }))

describe("useService", () => {
  it("should get service", async () => {
    const { result } = renderHook(() => useService(foo))
    expect(result.current.value).toBe(1)
  })
})
