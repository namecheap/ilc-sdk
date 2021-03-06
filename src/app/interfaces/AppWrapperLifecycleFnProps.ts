import { AppLifecycleFnProps } from './AppLifecycleFnProps';
import { CustomProps } from './CustomProps';

/**
 * Describes all properties that are passed by ILC & single-spa to the **application wrapper** lifecycle Fns
 */
export interface AppWrapperLifecycleFnProps<RegProps = unknown> extends AppLifecycleFnProps<RegProps> {
    /**
     * Allows to perform rendering of the target app. Returns promise which resolves after target app mount.
     * See more details in [ILC App Wrappers documentation](https://github.com/namecheap/ilc/blob/master/docs/app_wrappers.md).
     */
    renderApp: <T = CustomProps>(props: T) => Promise<void>;
}
