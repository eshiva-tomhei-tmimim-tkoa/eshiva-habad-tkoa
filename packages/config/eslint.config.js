import js from "@eslint/js";
import tseslint from "typescript-eslint";

/**
 * Базовый flat-config ESLint для всех пакетов монорепо.
 * Приложения расширяют его своими (next/react) правилами.
 */
export default tseslint.config(
  {
    ignores: ["**/dist/**", "**/.next/**", "**/node_modules/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
);
