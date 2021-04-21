import { CustomProps } from './CustomProps';
import { LifeCycles } from './LifeCycles';
import { ParcelLifecycleFnProps } from './ParcelLifecycleFnProps';

export type ParcelConfig<ExtraProps = CustomProps> =
    | LifeCycles<ParcelLifecycleFnProps<ExtraProps>>
    | (() => Promise<LifeCycles<ParcelLifecycleFnProps<ExtraProps>>>);
