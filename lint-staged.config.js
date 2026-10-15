/**
 * @type {import('lint-staged').Config}
 */
module.exports = {
    '*': 'prettier --ignore-unknown --write',
    'src/**/*.ts': 'eslint --fix',
};
