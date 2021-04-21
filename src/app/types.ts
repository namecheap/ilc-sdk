export * from './interfaces/AppLifecycleFnProps';
export * from './interfaces/AppWrapperLifecycleFnProps';
export * from './interfaces/common';
export * from './interfaces/ErrorHandler';
export * from './interfaces/IIlcAppSdk';
export * from './interfaces/LifeCycles';
export * from './interfaces/MountParcel';
export * from './interfaces/ParcelConfig';
export * from './interfaces/ParcelLifecycleFnProps';
export * from './interfaces/ParcelMountProps';
export * from './interfaces/ParcelObject';
export * from './interfaces/ParcelSdk';
export * from './interfaces/SingleSpaLifecycleFnProps';

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
