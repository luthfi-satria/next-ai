// eslint.config.mts
import js from "@eslint/js"
import globals from "globals"
import tseslint from "typescript-eslint"
import pluginReact from "eslint-plugin-react"
import pluginReactHooks from "eslint-plugin-react-hooks"
import prettier from "eslint-config-prettier"
import pluginPrettier from "eslint-plugin-prettier"
import * as fs from "fs"
import * as path from "path"

const prettierConfig = JSON.parse(
  fs.readFileSync(path.resolve("./.prettierrc"), "utf8"),
)

export default tseslint.config({
  files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  extends: [js.configs.recommended, ...tseslint.configs.recommended, prettier],
  plugins: {
    react: pluginReact,
    "react-hooks": pluginReactHooks,
    prettier: pluginPrettier,
  },
  languageOptions: {
    parserOptions: {
      project: "./tsconfig.json",
      tsconfigRootDir: import.meta.dirname,
      ecmaFeatures: {
        jsx: true,
      },
      ecmaVersion: "latest",
      sourceType: "module",
    },
    globals: {
      ...globals.browser,
      ...globals.node,
    },
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  rules: {
    ...pluginReact.configs.recommended.rules,
    ...pluginReactHooks.configs.recommended.rules,
    "prettier/prettier": ["warn", prettierConfig],
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
      },
    ],
  },
})
