export default (templateString: string) => {
    const templateFunction = new Function(`return \`${templateString}\`;`);
    return templateFunction();
};
