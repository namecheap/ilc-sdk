import { ParcelObject } from './interfaces/ParcelObject';
import { LifeCycles } from './interfaces/LifeCycles';
import { ParcelLifecycleFnProps } from './interfaces/ParcelLifecycleFnProps';
import { ParcelConfig } from './interfaces/ParcelConfig';
import { ParcelMountProps } from './interfaces/ParcelMountProps';

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
        return (window as any).ILC.navigate(urlWithoutLocale);
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
        return (window as any).ILC.importParcelFromApp(appName, parcelName);
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
    static mountRootParcel<ExtraProps = {}>(
        parcelConfig: ParcelConfig<ExtraProps>,
        parcelProps: ParcelMountProps & ExtraProps,
    ): ParcelObject<ExtraProps> {
        return (window as any).ILC.mountRootParcel(parcelConfig, parcelProps);
    }
}
