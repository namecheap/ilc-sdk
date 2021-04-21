/**
 * Entrypoint for SDK that should be used within application bundle
 *
 * @example
 * ```
 * import IlcAppSdk from 'ilc-sdk/app';
 * ```
 *
 * @module
 */
import * as types from './types';
import { IlcIntl } from './IlcIntl';
import defaultIntlAdapter from './defaultIntlAdapter';
import { IIlcAppSdk } from './interfaces/IIlcAppSdk';

export * from './types';
export * from './GlobalBrowserApi';
export * from './IlcIntl';

/**
 * @internal
 * @deprecated use `IlcIntl` export instead
 */
export const Intl = IlcIntl;

/**
 * @name IlcAppSdk
 */
export default class IlcAppSdk implements IIlcAppSdk {
    public intl: IlcIntl;
    /** Unique application ID, if same app will be rendered twice on a page - it will get different IDs */
    public appId: string;

    constructor(private adapter: types.AppSdkAdapter) {
        if (!this.adapter) {
            throw new Error('Unable to determine adapter properly...');
        }

        this.appId = this.adapter.appId;

        const intlAdapter = this.adapter.intl ? this.adapter.intl : defaultIntlAdapter;
        this.intl = new IlcIntl(this.appId, intlAdapter);
    }

    unmount() {
        this.intl.unmount();
    }
}
