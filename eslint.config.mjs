import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // Only disable/warn problematic rules to allow deployment without errors
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",       // Warn rather than error
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" } // Ignore unused vars starting with _
      ],
      "@next/next/no-img-element": "warn",                // Warn instead of error for using <img>
    },
  },
];

export default eslintConfig;
