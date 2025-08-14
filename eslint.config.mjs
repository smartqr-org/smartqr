import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'

export default [
  { ignores: ['**/dist/**', '**/coverage/**', '**/.vercel/**'] },
  {
    rules: {
      'no-empty': ['error', { allowEmptyCatch: true }],
    }
  },


  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    languageOptions: {
      parser: tseslint.parser,
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },

  {
    files: ['packages/react/**/*.{ts,tsx}'],
    plugins: { react: reactPlugin, 'react-hooks': reactHooks },
    settings: { react: { version: 'detect' } },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  {
    files: [
      '**/*.test.{ts,tsx}',
      'packages/**/src/tests/**/*.{ts,tsx}',
      'examples/**/src/**/*.{ts,tsx}',
      'scripts/**/*.ts',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },

  {
    files: ['packages/core/src/resolve.ts'],
    rules: { 'no-empty': 'warn' },
  },

  {
    files: [
      '**/vitest.config.{ts,js,cjs,mjs}',
      '**/vite.config.{ts,js,cjs,mjs}',
      '**/*.config.{ts,js,cjs,mjs}',
    ],
    languageOptions: { globals: globals.node },
  },
]
