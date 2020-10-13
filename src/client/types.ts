/**
 * Result of the "processRequest" method
 */
export interface IntlAdapter {
    get: () => Required<IntlConfig>;
    getDefault: () => Required<IntlConfig>;
    getSupported: () => { locale: string[]; currency: string[] };
    set?: (p: IntlConfig) => Promise<void>; // Passed only at CSR
}

export interface IntlUpdateEvent extends CustomEvent {
    detail: {
        locale: string;
        currency: string;
        addPendingResources: (promise: Promise<any>) => void;
        onAllResourcesReady: () => Promise<void>;
    };
}

/**
 * Result of the "processRequest" method
 */
export interface ClientSdkAdapter {
    /** Unique application ID, if same app will be rendered twice on a page - it will get different IDs */
    appId?: string;
    intl: IntlAdapter | null;
}

export interface IntlConfig {
    locale?: string;
    currency?: string;
}
