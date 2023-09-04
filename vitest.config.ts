/// <reference types="vitest" />

import babel from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"
import babelConfig from "./.babel.mjs.json"

export default defineConfig({
  plugins: [babel({ babel: babelConfig })],
  test: {
    include: ["./test/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["./test/utils/**/*.ts", "./test/**/*.init.ts"],
    setupFiles: "./test/utils/setup.ts",
    environment: "jsdom",
    globals: true
  },
  resolve: {
    alias: {
      "effect-react/test": path.join(__dirname, "test"),
      "effect-react": path.join(__dirname, "src")
    }
  }
})
