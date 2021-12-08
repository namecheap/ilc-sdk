/**
 * Result of the "processRequest" method
 */
export interface IntlAdapter {
    config: IntlAdapterConfig;
    /** Allows to get current Intl config */
    get: () => Required<IntlConfig>;
    /** [Passed only at CSR] Allows to change current Intl config */
    set?: (p: IntlConfig) => void;
}

export enum RoutingStrategy {
    PrefixExceptDefault = 'prefix_except_default',
    Prefix = 'prefix',
}

export interface IntlAdapterConfig {
    default: Required<IntlConfig>;
    supported: { locale: string[]; currency: string[] };
    routingStrategy: RoutingStrategy;
}

/**
 * Result of the "window.ILC.getAppSdkAdapter" method
 */
export interface AppSdkAdapter {
    /** Unique application ID, if same app will be rendered twice on a page - it will get different IDs */
    appId: string;
    intl: IntlAdapter | null;
    setStatusCode: (code: number) => void;
    getStatusCode: () => number | undefined;
}

export type Render404 = () => void;

export interface IntlConfig {
    locale?: string;
    currency?: string;
}
