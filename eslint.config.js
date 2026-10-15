const { defineConfig } = require('eslint/config');
const js = require('@eslint/js');
const tseslint = require('typescript-eslint');

/**
 * Replaces the former `tslint:recommended` + `tslint-config-prettier` setup.
 * Formatting is left to Prettier; the rules below mirror what TSLint enforced.
 *
 * @type {import('eslint').Linter.Config[]}
 */
module.exports = defineConfig(
    js.configs.recommended,
    tseslint.configs.recommended,
    {
        files: ['**/*.ts'],
        rules: {
            // Equivalents of the tslint:recommended rules that are not already part of the presets above
            '@typescript-eslint/adjacent-overload-signatures': 'error',
            '@typescript-eslint/array-type': ['error', { default: 'array' }],
            '@typescript-eslint/consistent-type-assertions': 'error',
            '@typescript-eslint/naming-convention': [
                'error',
                { selector: ['class', 'interface'], format: ['PascalCase'] },
                {
                    selector: 'variable',
                    format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
                    leadingUnderscore: 'allow',
                },
            ],
            '@typescript-eslint/prefer-for-of': 'error',
            '@typescript-eslint/prefer-function-type': 'error',
            '@typescript-eslint/unified-signatures': 'error',
            'dot-notation': 'error',
            eqeqeq: ['error', 'always', { null: 'ignore' }],
            'guard-for-in': 'error',
            'max-classes-per-file': ['error', 1],
            'no-bitwise': 'error',
            'no-caller': 'error',
            'no-console': 'error',
            'no-eval': 'error',
            'no-new-wrappers': 'error',
            'no-throw-literal': 'error',
            'no-undef-init': 'error',
            'object-shorthand': 'error',
            'prefer-arrow-callback': ['error', { allowNamedFunctions: true }],
            radix: 'error',

            // Rules TSLint did not enforce (disabled in tslint.json or absent from tslint:recommended)
            '@typescript-eslint/no-empty-function': 'off',
            '@typescript-eslint/no-empty-object-type': ['error', { allowObjectTypes: 'always' }],
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unsafe-function-type': 'off',
            '@typescript-eslint/no-unused-expressions': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/no-wrapper-object-types': 'off',
            'no-empty': 'off',
            'no-prototype-builtins': 'off',
        },
    },
    {
        // Mirrors the inline `tslint:disable-next-line:no-console` kept in this file:
        // its source is injected verbatim into app bundles, so the comment is left untouched.
        files: ['src/app/utils/resolveDirectory.ts'],
        rules: {
            'no-console': 'off',
        },
    },
);
