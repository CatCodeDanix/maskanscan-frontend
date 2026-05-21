import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import eslintPluginBetterTailwindcss from "eslint-plugin-better-tailwindcss";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    extends: [eslintPluginBetterTailwindcss.configs.recommended],
    settings: {
      "better-tailwindcss": {
        entryPoint: "app/globals.css",
      },
    },
  },
  eslintConfigPrettier,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
