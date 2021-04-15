import { ParcelObject } from './ParcelObject';
import { ParcelConfig } from './ParcelConfig';
import { ParcelMountProps } from './ParcelMountProps';

export interface SingleSpaLifecycleFnProps {
    /** Unique application ID, if same app will be rendered twice on a page - it will get different IDs */
    name: string;

    /**
     * Each application is provided a `mountParcel` function. The main advantage to using an applications `mountParcel` function
     * is that parcels mounted via an applications `mountParcel` will be automatically unmounted when the application is unmounted.
     */
    mountParcel<ExtraProps = {}>(
        parcelConfig: ParcelConfig<ExtraProps>,
        customProps: ParcelMountProps & ExtraProps,
    ): ParcelObject<ExtraProps>;

    // singleSpa: any; - removed, as apps/parcels shouldn't interact with single-spa global API directly
}
