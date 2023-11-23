import { LifeCycles } from './interfaces/LifeCycles';
import { ParcelLifecycleFnProps } from './interfaces/ParcelLifecycleFnProps';
import { MountParcel } from './interfaces/MountParcel';
import { GetAllSharedLibNames } from './interfaces/GetAllSharedLibNames';

/**
 * ILC exposes some utility APIs globally at `window.ILC`. Here we provide convenience typings to use with typescript.
 *
 * @example
 * ```
 * import { GlobalBrowserApi } from 'ilc-sdk/app';
 *
 * GlobalBrowserApi.navigate('/mypath');
 * ```
 */
export class GlobalBrowserApi {
    /**
     * Can be used for programmatic route change at simple apps.
     * Localization of the URL will be done automatically.
     */
    static navigate(urlWithoutLocale: string): void {
        return window.ILC.navigate(urlWithoutLocale);
    }

    /**
     * Allows to fetch Parcel from the application and inject it with ILC specific configuration.
     *
     * @example
     * ```javascript
     * import Parcel from 'single-spa-react/parcel';
     *
     * <Parcel
     * config={() => ILC.importParcelFromApp('@portal/people', 'person')}
     * wrapWith="div"
     * prop1="value1"
     * />
     * ```
     */
    static importParcelFromApp<ExtraProps = {}>(
        appName: string,
        parcelName: string,
    ): Promise<LifeCycles<ParcelLifecycleFnProps<ExtraProps>>> {
        return window.ILC.importParcelFromApp(appName, parcelName);
    }

    /**
     * Will create and mount a single-spa parcel. See [details here](https://single-spa.js.org/docs/api/#mountrootparcel).
     *
     * @example
     * ```javascript
     * const parcel = ILC.mountRootParcel(() => ILC.importParcelFromApp('@portal/people', 'person'), {
     *  prop1: 'value1',
     *  domElement: document.getElementById('a-div'),
     * });
     * ```
     */
    static mountRootParcel: MountParcel = (parcelConfig, parcelProps) => {
        return window.ILC.mountRootParcel(parcelConfig, parcelProps);
    };

    /**
     * Will return names of all registered shared libraries in ILC-Registry
     *
     * @example
     * ```javascript
     * const sharedLibNames = await ILC.getAllSharedLibNames();
     * ```
     */
    static getAllSharedLibNames: GetAllSharedLibNames = () => {
        return window.ILC.getAllSharedLibNames();
    };
}
