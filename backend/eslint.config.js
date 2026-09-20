import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.node },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
      "prefer-const": "error",
      "no-var": "error",
      "no-unused-expressions": "error",
      "eqeqeq": ["error", "always"],
      "prefer-template": "error",
      "object-shorthand": ["error", "always"],
    },
  },
]);
