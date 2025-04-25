import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("eslint:recommended"),  // Extends recommended rules
  {
    rules: {
      // Disable everything by setting rules to "off"
      "no-unused-vars": "off",
      "no-console": "off",
      "no-debugger": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      // Disable every single rule
    },
  },
];

export default eslintConfig;
