import eslint from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import prettierConfig from "eslint-config-prettier";

export default defineConfigWithVueTs(
  {
    ignores: ["lib/**", "coverage/**", "node_modules/**", "**/*.cjs"]
  },
  eslint.configs.recommended,
  pluginVue.configs["flat/recommended"],
  vueTsConfigs.recommended,
  prettierConfig,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off"
    }
  }
);
