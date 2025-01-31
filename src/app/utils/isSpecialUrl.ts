const startsWithSpecialUrls = ['#', 'tel:', 'mailto:', 'javascript:'];
const regex = new RegExp(`^(${startsWithSpecialUrls.join('|')})`);

export function isSpecialUrl(url: string): boolean {
    return regex.test(url) || url === '';
}
