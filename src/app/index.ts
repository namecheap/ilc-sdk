import * as types from './types';
import IlcIntl from './IlcIntl';
import defaultIntlAdapter from './defaultIntlAdapter';

export * from './types';

export const Intl = IlcIntl;

/**
 * Entrypoint for SDK that should be used within application bundle
 */
export default class IlcAppSdk {
    public intl: IlcIntl;
    /** Unique application ID, if same app will be rendered twice on a page - it will get different IDs */
    public appId: string;

    constructor(private adapter: types.ClientSdkAdapter) {
        if (!this.adapter) {
            throw new Error('Unable to determine adapter properly...');
        }

        this.appId = this.adapter.appId;

        const intlAdapter = this.adapter.intl ? this.adapter.intl : defaultIntlAdapter;
        this.intl = new IlcIntl(intlAdapter);
    }

    unmount() {
        this.intl.unmount();
    }
}
