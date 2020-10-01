/**
 * Result of the "processRequest" method
 */
export interface IntlAdapter {
    get: () => { locale: string, currency: string };
    getDefault: () => { locale: string, currency: string };
    getSupported: () => { locale: string[], currency: string[] };
    set?: (p: {locale?: string, currency?: string}) => Promise<void>; // Passed only at CSR
}

export interface IntlUpdateEvent extends CustomEvent {
    detail: {
        locale: string;
        currency: string;
        addPendingResources: (promise: Promise<any>) => void
        onAllResourcesReady: () => Promise<void>
    }
}

/**
 * Result of the "processRequest" method
 */
export interface ClientSdkAdapter {
    /** Unique application ID, if same app will be rendered twice on a page - it will get different IDs */
    appId?: string;
    intl: IntlAdapter;
}