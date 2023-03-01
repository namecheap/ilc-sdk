import * as types from './types';
import parseAsFullyQualifiedURI from './utils/parseAsFullyQualifiedURI';
import defaultIntlAdapter from './defaultIntlAdapter';
import { isSpecialUrl } from './utils/isSpecialUrl';
import { OptionsIntl } from './interfaces/OptionsSdk';

/**
 * **WARNING:** this class shouldn't be imported directly in the apps or adapters. Use `IlcAppSdk` instead.
 */
export class IlcIntl {
    private adapter: types.IntlAdapter;
    private listeners: any[] = [];
    private static eventName = 'ilc:intl-update';

    constructor(private appId: string, adapter?: types.IntlAdapter, private options?: OptionsIntl) {
        if (!adapter) {
            adapter = defaultIntlAdapter;
        }

        this.adapter = adapter;
    }

    /**
     * Allows to retrieve current i18n configuration
     */
    public get() {
        return this.adapter.get();
    }

    /**
     * Allows to retrieve default i18n configuration
     */
    public getDefault() {
        return this.adapter.config.default;
    }

    /**
     * Allows to fetch all supported values for currency & locale
     */
    public getSupported() {
        return this.adapter.config.supported;
    }

    /**
     * Changes locale or currency for the whole page
     *
     * @param config
     */
    public set(config: types.IntlConfig): void {
        if (!this.adapter.set) {
            throw new Error("Looks like you're trying to call CSR only method during SSR.");
        }

        return this.adapter.set(config);
    }

    /**
     * Get localisation manifest file.
     * File could be accessible optionally. The trick is useful
     *
     */
    public getLocalisationManifestPath(): string | undefined {
        return this.options?.manifestPath;
    }

    /**
     * Allows to convert plain URL into a one that contains i18n information.
     *
     * @param url - absolute path or absolute URI. Ex: "/test?a=1" or "http://tst.com/"
     * @param configOverride - allows to override current i18n configuration & retrieve localized URL for desired configuration.
     */
    public localizeUrl(url: string, configOverride: { locale?: string } = {}): string {
        return IlcIntl.localizeUrl(this.adapter.config, url, { ...this.adapter.get(), ...configOverride });
    }

    /**
     * Allows to parse URL and receive "non-localized" URL and information about locale that was encoded in URL.
     *
     * @param url - absolute path or absolute URI. Ex: "/test?a=1" or "http://tst.com/"
     */
    public parseUrl(url: string): { locale: string; cleanUrl: string } {
        return IlcIntl.parseUrl(this.adapter.config, url);
    }

    /**
     * [CSR ONLY] Allows to watch changes to locale or currency that are happening at the client side.
     * @param prepareForChange
     * @param performChange
     * @returns - callback that can be used to unsubscribe from changes
     */
    public onChange<T>(
        prepareForChange: (event: types.IntlUpdateEvent) => Promise<T> | T,
        performChange: (event: types.IntlUpdateEvent, preparedData: T) => Promise<void> | void,
    ) {
        if (!this.adapter.set) {
            return () => {}; // Looks like you're trying to call CSR only method during SSR. Doing nothing...
        }

        const wrappedCb = (e: types.IntlUpdateEventInternal) => {
            e.detail.addHandler({
                actorId: this.appId,
                prepare: prepareForChange,
                execute: performChange,
            });
        };

        window.addEventListener(IlcIntl.eventName, wrappedCb as EventListener);
        this.listeners.push(wrappedCb);

        return () => {
            for (const row of this.listeners) {
                if (row === wrappedCb) {
                    window.removeEventListener(IlcIntl.eventName, row);
                    this.listeners.slice(this.listeners.indexOf(wrappedCb), 1);
                    break;
                }
            }
        };
    }

    /**
     * [CSR ONLY] In apps that are running under ILC it shouldn't be used directly.
     */
    public unmount() {
        if (!this.adapter.set) {
            throw new Error("Looks like you're trying to call CSR only method during SSR.");
        }

        for (const callback of this.listeners) {
            window.removeEventListener(IlcIntl.eventName, callback);
        }

        this.listeners = [];
    }

    /**
     * Allows to convert plain URL into a one that contains i18n information.
     *
     * @param config
     * @param url - absolute path or absolute URI. Ex: "/test?a=1" or "http://tst.com/"
     * @param configOverride - allows to override default locale
     *
     * @internal Used internally by ILC
     */
    static localizeUrl(config: types.IntlAdapterConfig, url: string, configOverride: { locale?: string } = {}): string {
        if (isSpecialUrl(url)) {
            return url;
        }

        const parsedUri = parseAsFullyQualifiedURI(url);
        url = parsedUri.uri;

        if (!url.startsWith('/')) {
            throw new Error(`Localization of relative URLs is not supported. Received: "${url}"`);
        }

        url = IlcIntl.parseUrl(config, url).cleanUrl;

        const receivedLocale = configOverride.locale || config.default.locale;

        const loc = IlcIntl.getCanonicalLocale(receivedLocale, config.supported.locale);

        if (loc === null) {
            throw new Error(`Unsupported locale passed. Received: "${receivedLocale}"`);
        }

        if (config.routingStrategy === types.RoutingStrategy.PrefixExceptDefault && loc === config.default.locale) {
            return parsedUri.origin + url;
        }

        return `${parsedUri.origin}/${IlcIntl.getShortenedLocale(loc, config.supported.locale)}${url}`;
    }

    /**
     * Allows to parse URL and receive "unlocalized" URL and information about locale that was encoded in URL.
     *
     * @param config
     * @param url - absolute path or absolute URI. Ex: "/test?a=1" or "http://tst.com/"
     *
     * @internal Used internally by ILC
     */
    static parseUrl(config: types.IntlAdapterConfig, url: string): { locale: string; cleanUrl: string } {
        if (isSpecialUrl(url)) {
            return {
                cleanUrl: url,
                locale: config.default.locale,
            };
        }

        const parsedUri = parseAsFullyQualifiedURI(url);
        url = parsedUri.uri;

        if (!url.startsWith('/')) {
            throw new Error(`Localization of relative URLs is not supported. Received: "${url}"`);
        }

        const [, langPart, ...path] = url.split('/');
        const lang = IlcIntl.getCanonicalLocale(langPart, config.supported.locale);

        if (lang !== null && config.supported.locale.indexOf(lang) !== -1) {
            return { cleanUrl: `${parsedUri.origin}/${path.join('/')}`, locale: lang };
        }

        return { cleanUrl: parsedUri.origin + url, locale: config.default.locale };
    }

    /**
     * Returns properly formatted locale string.
     * Ex: en -> en-US; en-gb -> en-GB
     *
     * @param locale
     * @param supportedLocales
     *
     * @internal Used internally by ILC
     */
    static getCanonicalLocale(locale = '', supportedLocales: string[]) {
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

    /**
     * Returns properly formatted short form of locale string.
     * Ex: en-US -> en, but en-GB -> en-GB
     *
     * @internal Used internally by ILC
     */
    static getShortenedLocale(canonicalLocale: string, supportedLocales: string[]): string {
        if (supportedLocales.indexOf(canonicalLocale) === -1) {
            throw new Error(`Unsupported locale passed. Received: ${canonicalLocale}`);
        }

        for (const loc of supportedLocales) {
            if (loc.split('-')[0] !== canonicalLocale.split('-')[0]) {
                continue;
            }

            if (loc === canonicalLocale) {
                return loc.split('-')[0];
            } else {
                return canonicalLocale;
            }
        }

        return canonicalLocale;
    }
}
