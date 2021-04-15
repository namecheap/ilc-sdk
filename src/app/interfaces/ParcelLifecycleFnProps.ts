import { ParcelSdk } from './ParcelSdk';
import { SingleSpaLifecycleFnProps } from './SingleSpaLifecycleFnProps';
import { ParcelMountProps } from './ParcelMountProps';

interface ParcelLifecycleFnPropsSystem<RegProps = unknown> extends SingleSpaLifecycleFnProps {
    parcelSdk: ParcelSdk<RegProps>;

    /** Allows Parcel to unmount itself */
    unmountSelf: () => Promise<null>;
}

/**
 * Describes all properties that are passed by ILC & single-spa to the application lifecycle Fns
 */
export type ParcelLifecycleFnProps<ExtraProps = {}, RegProps = unknown> = ExtraProps &
    ParcelMountProps &
    ParcelLifecycleFnPropsSystem<RegProps>;
