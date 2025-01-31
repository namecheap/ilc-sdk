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

    const { uri, origin } = parseAsFullyQualifiedURI(url);

    if (!uri.startsWith('/')) {
        throw new Error(`Localization of relative URLs is not supported. Received: "${url}"`);
    }

    const { cleanUrl } = parseUrl(config, uri);

    const receivedLocale = configOverride.locale || config.default.locale;

    const locale = getCanonicalLocale(receivedLocale, config.supported.locale);

    if (locale === null) {
        throw new Error(`Unsupported locale passed. Received: "${receivedLocale}"`);
    }

    if (config.routingStrategy === RoutingStrategy.PrefixExceptDefault && locale === config.default.locale) {
        return origin + cleanUrl;
    }

    return `${origin}/${getShortenedLocale(locale, config.supported.locale)}${cleanUrl}`;
}
