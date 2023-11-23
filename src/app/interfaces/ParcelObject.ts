import { AppStatus } from './AppStatus';
import { CustomProps } from './CustomProps';

/**
 * Parcel object, similar to `React.Element` with the only difference that it is mutable.
 * While {@link ParcelConfig} is a `React.Component`.
 */
export interface ParcelObject<ExtraProps = CustomProps> {
    /**
     * Returns a promise that resolves once the parcel is successfully mounted. The promise can throw an error which needs to be handled.
     */
    mount(): Promise<null>;

    /**
     * Returns a promise that resolves once the parcel is successfully unmounted. The promise may throw an error which needs to be handled.
     */
    unmount(): Promise<null>;

    /**
     * Allows you to change the props passed into a parcel. Note that not all parcels support being updated.
     * The update function returns a promise that resolves when the parcel is finished updating.
     * See [other documentation](https://single-spa.js.org/docs/parcels-overview.html#update-optional)
     * and [example](https://single-spa.js.org/docs/parcels-overview.html#quick-example) for more information.
     * @param customProps
     */
    update?(customProps: ExtraProps): Promise<null>;

    /**
     * Returns a string of that parcels status. The string status is one of the following:
     */
    getStatus(): AppStatus;

    /**
     * Returns a promise that will resolve once the parcel has been loaded.
     */
    loadPromise: Promise<null>;
    /**
     * Returns a promise that will resolve once the parcel has been bootstrapped.
     */
    bootstrapPromise: Promise<null>;
    /**
     * Returns a promise that will resolve once the parcel has been mounted. This is helpful for knowing exactly when a parcel has been appended to the DOM
     */
    mountPromise: Promise<null>;
    /**
     * Returns a promise that will resolve once the parcel has been unmounted.
     */
    unmountPromise: Promise<null>;
}
