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

    constructor(private adapter: types.ClientSdkAdapter) {
        if (!this.adapter) {
            throw new Error('Unable to determine adapter properly...');
        }

        const intlAdapter = this.adapter.intl ? this.adapter.intl : defaultIntlAdapter;

        this.intl = new IlcIntl(intlAdapter);
    }

    unmount() {
        this.intl.unmount();
    }
}
