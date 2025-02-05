import { defaultIntlAdapter } from './defaultIntlAdapter';
import { OptionsIntl } from './interfaces/OptionsSdk';
import type { IntlAdapter, IntlConfig, IntlUpdateEvent, IntlUpdateEventInternal } from './types';
import { TtlCache } from './utils/TtlCache';
import { getCanonicalLocale } from './utils/getCanonicalLocale';
import { localizeUrl } from './utils/localizeUrl';
import { parseUrl } from './utils/parseUrl';

export const cache = new TtlCache();

/**
 * **WARNING:** this class shouldn't be imported directly in the apps or adapters. Use `IlcAppSdk` instead.
 */
export class IlcIntl {
    private listeners: ((event: IntlUpdateEventInternal) => void)[] = [];
    private static eventName = 'ilc:intl-update';

    constructor(
        private readonly appId: string,
        private readonly adapter: IntlAdapter = defaultIntlAdapter,
        private readonly options?: OptionsIntl,
    ) {}

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
    public set(config: IntlConfig): void {
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
        prepareForChange: (event: IntlUpdateEvent) => Promise<T> | T,
        performChange: (event: IntlUpdateEvent, preparedData: T) => Promise<void> | void,
    ) {
        if (!this.adapter.set) {
            return () => {}; // Looks like you're trying to call CSR only method during SSR. Doing nothing...
        }

        const wrappedCb = (e: IntlUpdateEventInternal) => {
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
                    window.removeEventListener(IlcIntl.eventName, row as EventListener);
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
            window.removeEventListener(IlcIntl.eventName, callback as EventListener);
        }

        this.listeners = [];
    }

    /**
     * Allows to convert plain URL into a one that contains i18n information.
     *
     * @param config
     * @param url - absolute path or absolute URI. Ex: "/test?a=1" or "http://tst.com/"
     * @param configOverride - allows to override default locales
     *
     * @internal Used internally by ILC
     */
    static localizeUrl = cache.wrap(
        localizeUrl,
        /**
         * supported locales and routing strategy are not expected to change during the runtime frequently
         * they are not included in the cache key
         * values will be cleaned up by TTL
         */
        (config, url, override) => `${override?.locale ?? config.default.locale}:${url}`,
    );

    /**
     * Allows to parse URL and receive "unlocalized" URL and information about locale that was encoded in URL.
     *
     * @param config
     * @param url - absolute path or absolute URI. Ex: "/test?a=1" or "http://tst.com/"
     *
     * @internal Used internally by ILC
     */
    static parseUrl = cache.wrap(parseUrl, (config, url) => url);

    /**
     * Returns properly formatted locale string.
     * Ex: en -> en-US; en-gb -> en-GB
     *
     * @param locale
     * @param supportedLocales
     *
     * @internal Used internally by ILC
     */
    static getCanonicalLocale = cache.wrap(getCanonicalLocale, (locale) => locale);
}
