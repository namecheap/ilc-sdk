module.exports = {
    '*': 'prettier --ignore-unknown --write',
    '*.ts': 'npm run lint -- --fix',
};
