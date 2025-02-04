import { RoutingStrategy, type IntlAdapterConfig } from '../types';
import { getCanonicalLocale } from './getCanonicalLocale';
import { getShortenedLocale } from './getShortenedLocale';
import { isSpecialUrl } from './isSpecialUrl';
import { parseAsFullyQualifiedURI } from './parseAsFullyQualifiedURI';
import { parseUrl } from './parseUrl';

type ConfigOverride = { locale?: string };

export function localizeUrl(config: IntlAdapterConfig, url: string, configOverride: ConfigOverride = {}): string {
    if (isSpecialUrl(url)) {
        return url;
    }

    const { path, origin } = parseAsFullyQualifiedURI(url);

    const { cleanUrl } = parseUrl(config, path);

    const receivedLocale = configOverride.locale ?? config.default.locale;

    const locale = getCanonicalLocale(receivedLocale, config.supported.locale);

    if (locale === null) {
        throw new Error(`Unsupported locale passed. Received: "${receivedLocale}"`);
    }

    if (config.routingStrategy === RoutingStrategy.PrefixExceptDefault && locale === config.default.locale) {
        return origin + cleanUrl;
    }

    const separator = cleanUrl.startsWith('/') ? '' : '/';

    return `${origin}/${getShortenedLocale(locale, config.supported.locale)}${separator}${cleanUrl}`;
}
