import { ParcelConfig } from './ParcelConfig';
import { ParcelMountProps } from './ParcelMountProps';
import { ParcelObject } from './ParcelObject';

export type MountParcel = <ExtraProps = {}>(
    parcelConfig: ParcelConfig<ExtraProps>,
    customProps: ParcelMountProps & ExtraProps,
) => ParcelObject<ExtraProps>;
