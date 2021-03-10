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
 * Result of the "processRequest" method
 */
export interface ClientSdkAdapter {
    /** Unique application ID, if same app will be rendered twice on a page - it will get different IDs */
    appId: string;
    intl: IntlAdapter | null;
}

/**
 * Properties passed by ILC to IlcParcelSdk
 */
export interface ParcelSdk<RegProps = any> {
    /** Unique parcel ID, if same parcel will be rendered twice on a page - they will get different IDs */
    parcelId: string;
    intl: IntlAdapter;
    registryProps: () => RegProps;
}

export interface WithParcelSdk<RegProps = any> {
    parcelSdk: ParcelSdk<RegProps>;
}

export interface IntlConfig {
    locale?: string;
    currency?: string;
}
