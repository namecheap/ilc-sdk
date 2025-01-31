/**
 * @type {import('lint-staged').Config}
 */
module.exports = {
    '*': 'prettier --ignore-unknown --write',
    'src/app/**/*.ts': 'tslint -p src/app --fix',
    'src/server/**/*.ts': 'tslint -p src/server --fix',
};
