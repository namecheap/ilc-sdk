export * from './commonTypes';

export interface IntlUpdateEvent {
    locale: string;
    currency: string;
}

/**
 * @internal
 */
export interface IntlUpdateEventInternal extends CustomEvent {
    detail: {
        locale: string;
        currency: string;
        addHandler: (h: { actorId: string; prepare: Function; execute: Function }) => void;
    };
}
