import { IlcIntl } from '../IlcIntl';

/**
 * Properties passed by ILC to IlcParcelSdk
 */
export interface ParcelSdk<RegProps = unknown> {
    /** Unique parcel ID, if same parcel will be rendered twice on a page - they will get different IDs */
    parcelId: string;
    intl: IlcIntl;
    registryProps: RegProps;
}
