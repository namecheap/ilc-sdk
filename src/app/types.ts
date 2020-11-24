export * from './commonTypes';

export interface IntlUpdateEvent {
    locale: string;
    currency: string;
    addPendingResources: typeof Promise.all;
    onAllResourcesReady: () => Promise<void>;
}
