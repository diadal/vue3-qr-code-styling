import { resolve } from "node:path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    vue(),
    dts({
      include: ["src/**/*.ts", "src/**/*.vue"],
      insertTypesEntry: true,
      cleanVueFileName: true
    })
  ],
  build: {
    outDir: "lib",
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "VQRCodeStyling",
      fileName: (format) => (format === "es" ? "index.js" : `index.${format}.cjs`),
      formats: ["es", "umd"]
    },
    rollupOptions: {
      // Keep Vue out of the bundle; consumers provide it.
      external: ["vue"],
      output: {
        // The entry (src/index.ts) only has a default export — the component.
        exports: "default",
        globals: {
          vue: "Vue"
        }
      }
    }
  }
});
