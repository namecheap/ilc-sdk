export * from './commonTypes';

export interface IntlUpdateEvent extends CustomEvent {
    detail: {
        locale: string;
        currency: string;
        addPendingResources: (promise: Promise<any>) => void;
        onAllResourcesReady: () => Promise<void>;
    };
}
