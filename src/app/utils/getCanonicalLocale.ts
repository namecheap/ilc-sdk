export function getCanonicalLocale(locale = '', supportedLocales: string[]) {
    const supportedLangs = supportedLocales.map((v) => v.split('-')[0]).filter((v, i, a) => a.indexOf(v) === i);

    const locData = locale.split('-');

    if (locData.length === 2) {
        locale = locData[0].toLowerCase() + '-' + locData[1].toUpperCase();
    } else if (locData.length === 1) {
        locale = locData[0].toLowerCase();
    } else {
        return null;
    }

    if (supportedLangs.indexOf(locale.toLowerCase()) !== -1) {
        for (const v of supportedLocales) {
            if (v.split('-')[0] === locale) {
                locale = v;
                break;
            }
        }
    } else if (supportedLocales.indexOf(locale) === -1) {
        return null;
    }

    return locale;
}
