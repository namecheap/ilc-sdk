export function getShortenedLocale(canonicalLocale: string, supportedLocales: string[]): string {
    if (supportedLocales.indexOf(canonicalLocale) === -1) {
        throw new Error(`Unsupported locale passed. Received: ${canonicalLocale}`);
    }

    for (const locale of supportedLocales) {
        if (locale.split('-')[0] !== canonicalLocale.split('-')[0]) {
            continue;
        }

        if (locale === canonicalLocale) {
            return locale.split('-')[0];
        } else {
            return canonicalLocale;
        }
    }

    return canonicalLocale;
}
