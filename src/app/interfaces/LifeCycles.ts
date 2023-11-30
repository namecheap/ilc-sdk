import { AppLifecycleFnProps } from './AppLifecycleFnProps';
import { AppWrapperLifecycleFnProps } from './AppWrapperLifecycleFnProps';
import { ParcelLifecycleFnProps } from './ParcelLifecycleFnProps';

export type LifeCycleFn<AppOrParcelProps> = (config: AppOrParcelProps) => Promise<any>;

export interface LifeCycles<
    AppOrParcelProps extends AppLifecycleFnProps | AppWrapperLifecycleFnProps | ParcelLifecycleFnProps,
> {
    bootstrap: LifeCycleFn<AppOrParcelProps> | LifeCycleFn<AppOrParcelProps>[];
    mount: LifeCycleFn<AppOrParcelProps> | LifeCycleFn<AppOrParcelProps>[];
    unmount: LifeCycleFn<AppOrParcelProps> | LifeCycleFn<AppOrParcelProps>[];
    update?: LifeCycleFn<AppOrParcelProps> | LifeCycleFn<AppOrParcelProps>[];
}
