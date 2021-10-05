export const isSpecialUrl = (url: string): boolean => {
    const startsWithSpecialUrls = ['#', 'tel:', 'mailto:', 'javascript:'];
    const regex = new RegExp(`^(${startsWithSpecialUrls.join('|')})`);
    return regex.test(url) || url === '';
};
