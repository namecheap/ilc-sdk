import * as types from './types';

export * from './types';

class IlcIntl {
    private adapter: types.IntlAdapter;
    private listeners: any[] = [];

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

    public set(p: {locale?: string, currency?: string}) {
        if (!this.adapter.set) {
            throw new Error('Looks like you\'re trying to call CSR only method during SSR.');
        }

        this.adapter.set(p);
    }

    /**
     * @param url - absolute URL
     * @param localeOverride
     */
    public localizeUrl(url: URL|string, localeOverride?: string): URL {
        url = this.getUrlCopy(url);

        const loc = localeOverride || this.adapter.get().locale;
        if (loc !== this.adapter.getDefault().locale) {
            url.pathname = `/${loc}${url}`;
        }

        return url;
    };

    public parseUrl(url: URL|string): {locale: string, cleanUrl: URL} {
        url = this.getUrlCopy(url);

        const [, lang, ...path] = url.pathname.split('/');

        if (this.adapter.getSupported().locale.indexOf(lang) !== -1) {
            url.pathname = `/${path.join('/')}`;

            return { cleanUrl: url, locale: lang };
        }

        return { cleanUrl: url, locale: this.adapter.getDefault().locale };
    }

    public watch(callback: (event: types.IntlUpdateEvent) => void) {
        if (!window.addEventListener) {
            throw new Error('Looks like you\'re trying to call CSR only method during SSR.');
        }

        window.addEventListener('ilc:intl-update', callback as EventListener);
        this.listeners.push(callback);
    }

    public unwatch() {
        if (!window.addEventListener) {
            throw new Error('Looks like you\'re trying to call CSR only method during SSR.');
        }

        for (let callback of this.listeners) {
            window.removeEventListener('ilc:intl-update', callback);
        }
    }

    private getUrlCopy(url: URL|string): URL {
        if (typeof url === 'string') {
            return  new URL(url);
        }

        // Creating a copy of the original object
        return new URL(url.toString());
    }
}

export default class IlcAppSdk {
    private adapter: types.ClientSdkAdapter;
    public intl: IlcIntl;

    constructor(adapter?: types.ClientSdkAdapter) {
        if (adapter) {
            this.adapter = adapter;
        } else if ((window as any).ILC) {
            this.adapter = (window as any).ILC.clientSdkAdapter as types.ClientSdkAdapter;
        } else {
            throw new Error('Unable to determine adapter properly...');
        }

        this.intl = new IlcIntl(this.adapter.intl);
    }
}