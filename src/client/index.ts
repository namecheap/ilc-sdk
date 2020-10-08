import * as types from './types';

export * from './types';

class IlcIntl {
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
        let [, lang, ...path] = url.split('/');

        lang = this.getCanonicalLocale(lang) as string;

        if (lang !== null && this.adapter.getSupported().locale.indexOf(lang) !== -1) {
            return { cleanUrl: `/${path.join('/')}`, locale: lang };
        }

        return { cleanUrl: url, locale: this.adapter.getDefault().locale };
    }

    public watch(callback: (event: types.IntlUpdateEvent) => void) {
        if (!window.addEventListener) {
            throw new Error("Looks like you're trying to call CSR only method during SSR.");
        }

        window.addEventListener(IlcIntl.eventName, callback as EventListener);
        this.listeners.push(callback);
    }

    public unwatch() {
        if (!window.addEventListener) {
            throw new Error("Looks like you're trying to call CSR only method during SSR.");
        }

        for (let callback of this.listeners) {
            window.removeEventListener(IlcIntl.eventName, callback);
        }
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
            for (let v of supportedLocales) {
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

        for (let loc of supportedLocales) {
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

export default class IlcAppSdk {
    private adapter: types.ClientSdkAdapter;
    public intl: IlcIntl | null;

    constructor(adapter?: types.ClientSdkAdapter) {
        if (adapter) {
            this.adapter = adapter;
        } else if ((window as any).ILC) {
            this.adapter = (window as any).ILC.clientSdkAdapter as types.ClientSdkAdapter;
        } else {
            throw new Error('Unable to determine adapter properly...');
        }

        this.intl = this.adapter.intl ? new IlcIntl(this.adapter.intl) : null;
    }
}
