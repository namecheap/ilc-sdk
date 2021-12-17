import { ErrorHandler } from './ErrorHandler';
import { IIlcAppSdk } from './IIlcAppSdk';
import { SingleSpaLifecycleFnProps } from './SingleSpaLifecycleFnProps';

/**
 * Describes all properties that are passed by ILC & single-spa to the application lifecycle Fns
 */
export interface AppLifecycleFnProps<RegProps = unknown> extends SingleSpaLifecycleFnProps {
    /**
     * Returns ref to `HTMLElement` that should be used as container to render app's content
     */
    domElementGetter: () => HTMLElement;
    /**
     * Returns _Props_ that were defined for current path
     */
    getCurrentPathProps: () => RegProps;
    /**
     * Base path that is relative to the matched route.
     *
     * So for `reqUrl = /a/b/c?d=1` & matched route `/a/*` base path will be `/a/`.
     * While for `reqUrl = /a/b/c?d=1` & matched route `/a/b/c` base path will be `/a/b/c`.
     */
    getCurrentBasePath: () => string;
    /**
     * App **MUST** use it to propagate all unhandled errors. Usually it's used in app's adapter.
     */
    errorHandler: ErrorHandler;
    /**
     * Isomorphic API that can be used during SSR & CSR. [Documentation](https://namecheap.github.io/ilc-sdk/classes/_app_index_.ilcappsdk.html)
     */
    appSdk: IIlcAppSdk;
}
