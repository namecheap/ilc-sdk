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
    /**
     * The appWrapperData object identifies that application execution is controlled by Wrapper
     * The namespace contains params that identifies Wrapper
     * appWrapperData.appId identifier of Wrapper
     */
    appWrapperData?: {
        appId: string;
    };

    /**
     * Returns Props that were defined for wrapped app. Method available only for wrappers
     */
    getWrappedAppProps?: () => RegProps;
}
