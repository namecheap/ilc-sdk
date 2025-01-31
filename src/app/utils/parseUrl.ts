import { type IntlAdapterConfig } from '../types';
import { getCanonicalLocale } from './getCanonicalLocale';
import { isSpecialUrl } from './isSpecialUrl';
import { parseAsFullyQualifiedURI } from './parseAsFullyQualifiedURI';

type ParsedUrl = {
    cleanUrl: string;
    locale: string;
};

export function parseUrl(config: IntlAdapterConfig, url: string): ParsedUrl {
    if (isSpecialUrl(url)) {
        return {
            cleanUrl: url,
            locale: config.default.locale,
        };
    }

    const { uri, origin } = parseAsFullyQualifiedURI(url);

    if (!uri.startsWith('/')) {
        throw new Error(`Localization of relative URLs is not supported. Received: "${uri}"`);
    }

    const [, langPart, ...path] = uri.split('/');
    const locale = getCanonicalLocale(langPart, config.supported.locale);

    if (locale !== null && config.supported.locale.indexOf(locale) !== -1) {
        return { cleanUrl: `${origin}/${path.join('/')}`, locale };
    }

    return { cleanUrl: origin + uri, locale: config.default.locale };
}
