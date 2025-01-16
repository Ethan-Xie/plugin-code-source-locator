import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'

import stylistic from '@stylistic/eslint-plugin'

/** @type {import('eslint').Linter.Config[]} */

// export default [
//   {files: ["**/*.{js,mjs,cjs,ts}"]},
// ];

export default tseslint.config(
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts,vue}'],
    rules: {
      'no-console': 'error',
      'prefer-const': ['error', {
        destructuring: 'any',
        ignoreReadBeforeAssign: false,
      }],
      // { "order": [["template", "script"], "style"]}
      // "vue/component-tags-order": ["error",
      //     { "order": ["template", "script", "style"] }
      // ]
    },
  },
  stylistic.configs.customize({
    indent: 2,
    quotes: 'single',
    semi: false,
    jsx: true,
    braceStyle: '1tbs',
    arrowParens: 'always',
  }))
