/**
 * @type {import('lint-staged').Config}
 */
module.exports = {
    '*': 'prettier --ignore-unknown --write',
    '*.ts': 'npm run lint -- --fix',
};
