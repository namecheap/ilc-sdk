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

    const { path, origin } = parseAsFullyQualifiedURI(url);

    if (!path.startsWith('/')) {
        throw new Error(`Localization of relative URLs is not supported. Received: "${url}"`);
    }

    const [, langPart, ...unlocalizedPath] = path.split('/');
    const locale = getCanonicalLocale(langPart, config.supported.locale);

    if (locale !== null && config.supported.locale.indexOf(locale) !== -1) {
        return { cleanUrl: `${origin}/${unlocalizedPath.join('/')}`, locale };
    }

    return { cleanUrl: origin + path, locale: config.default.locale };
}
