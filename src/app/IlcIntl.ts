import * as types from './types';

export * from './types';

export default class IlcIntl {
    private adapter: types.IntlAdapter;
    private listeners: any[] = [];
    private static eventName = 'ilc:intl-update';

    constructor(adapter: types.IntlAdapter) {
        this.adapter = adapter;
    }

    public get() {
        return this.adapter.get();
    }

    public getDefault() {
        return this.adapter.getDefault();
    }

    public getSupported() {
        return this.adapter.getSupported();
    }

    /**
     * Allows to change locale or currency for the whole page
     *
     * @param config
     */
    public set(config: types.IntlConfig): Promise<void> {
        if (!this.adapter.set) {
            throw new Error("Looks like you're trying to call CSR only method during SSR.");
        }

        return this.adapter.set(config);
    }

    public localizeUrl(url: string, configOverride: types.IntlConfig = {}): string {
        url = this.parseUrl(url).cleanUrl;

        const receivedLocale = configOverride.locale || this.adapter.get().locale;
        const loc = this.getCanonicalLocale(receivedLocale);
        if (loc === null) {
            throw new Error(`Unsupported locale passed. Received: "${receivedLocale}"`);
        }

        if (loc !== this.adapter.getDefault().locale) {
            url = `/${this.getShortenedLocale(loc)}${url}`;
        }

        return url;
    }

    /**
     * Allows to parse URL and receive "unlocalized" URL and information about locale that was encoded in URL.
     *
     * @param url
     * @param defaultLocale
     * @param supportedLocales
     */
    public static parseUrl(
        url: string,
        defaultLocale: string,
        supportedLocales: string[],
    ): { locale: string; cleanUrl: string } {
        // TODO: what if currency is also a part of URL?
        const [, langPart, ...path] = url.split('/');

        const lang = IlcIntl.getCanonicalLocale(langPart, supportedLocales);

        if (lang !== null && supportedLocales.indexOf(lang) !== -1) {
            return { cleanUrl: `/${path.join('/')}`, locale: lang };
        }

        return { cleanUrl: url, locale: defaultLocale };
    }

    /**
     * Allows to parse URL and receive "unlocalized" URL and information about locale that was encoded in URL.
     *
     * @param url
     */
    public parseUrl(url: string): { locale: string; cleanUrl: string } {
        return IlcIntl.parseUrl(url, this.adapter.getDefault().locale, this.adapter.getSupported().locale);
    }

    /**
     * [CSR ONLY] Allows to watch changes to locale or currency that are happening at the client side.
     * @param callback
     */
    public watch(callback: (event: types.IntlUpdateEvent) => void): () => void {
        if (!window.addEventListener) {
            throw new Error("Looks like you're trying to call CSR only method during SSR.");
        }

        window.addEventListener(IlcIntl.eventName, callback as EventListener);
        this.listeners.push(callback);

        return () => {
            for (const row of this.listeners) {
                if (row === callback) {
                    window.removeEventListener(IlcIntl.eventName, row);
                    this.listeners.slice(this.listeners.indexOf(callback), 1);
                    break;
                }
            }
        };
    }

    /**
     * [CSR ONLY] In apps that are running under ILC it shouldn't be used directly.
     */
    public unmount() {
        if (!window.addEventListener) {
            throw new Error("Looks like you're trying to call CSR only method during SSR.");
        }

        for (const callback of this.listeners) {
            window.removeEventListener(IlcIntl.eventName, callback);
        }

        this.listeners = [];
    }

    /**
     * Returns properly formatted locale string.
     * Ex: en -> en-US; en-gb -> en-GB
     *
     * @param locale
     * @param supportedLocales
     */
    public static getCanonicalLocale(locale: string, supportedLocales: string[]) {
        const supportedLangs = supportedLocales.map((v) => v.split('-')[0]).filter((v, i, a) => a.indexOf(v) === i);

        const locData = locale.split('-');
        if (locData.length === 2) {
            locale = locData[0].toLowerCase() + '-' + locData[1].toUpperCase();
        } else if (locData.length === 1) {
            locale = locData[0].toLowerCase();
        } else {
            throw new Error(`Unexpected locale format. Received: ${locale}`);
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

    private getCanonicalLocale(locale: string) {
        return IlcIntl.getCanonicalLocale(locale, this.adapter.getSupported().locale);
    }

    private getShortenedLocale(canonicalLocale: string) {
        const supportedLocales = this.adapter.getSupported().locale;

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
