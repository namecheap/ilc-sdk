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

    public set(p: { locale?: string; currency?: string }): Promise<void> {
        if (!this.adapter.set) {
            throw new Error("Looks like you're trying to call CSR only method during SSR.");
        }

        return this.adapter.set(p);
    }

    /**
     * @param url - absolute URL
     * @param localeOverride
     */
    public localizeUrl(url: string, localeOverride?: string): string {
        url = this.parseUrl(url).cleanUrl;

        const loc = this.getCanonicalLocale(localeOverride || this.adapter.get().locale);
        if (loc === null) {
            throw new Error(`Unsupported locale passed. Received: ${loc}`);
        }

        if (loc !== this.adapter.getDefault().locale) {
            url = `/${this.getShortenedLocale(loc)}${url}`;
        }

        return url;
    }

    public parseUrl(url: string): { locale: string; cleanUrl: string } {
        const [, langPart, ...path] = url.split('/');

        const lang = this.getCanonicalLocale(langPart);

        if (lang !== null && this.adapter.getSupported().locale.indexOf(lang) !== -1) {
            return { cleanUrl: `/${path.join('/')}`, locale: lang };
        }

        return { cleanUrl: url, locale: this.adapter.getDefault().locale };
    }

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

    public unmount() {
        if (!window.addEventListener) {
            throw new Error("Looks like you're trying to call CSR only method during SSR.");
        }

        for (const callback of this.listeners) {
            window.removeEventListener(IlcIntl.eventName, callback);
        }

        this.listeners = [];
    }

    private getCanonicalLocale(locale: string) {
        const supportedLocales = this.adapter.getSupported().locale;
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
