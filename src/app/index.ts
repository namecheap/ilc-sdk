import * as types from './types';
import IlcIntl from './IlcIntl';

export * from './types';

export const Intl = IlcIntl;

/**
 * Entrypoint for SDK that should be used within application bundle
 */
export default class IlcAppSdk {
    public intl: IlcIntl | null;

    constructor(private adapter: types.ClientSdkAdapter) {
        if (!this.adapter) {
            throw new Error('Unable to determine adapter properly...');
        }

        this.intl = this.adapter.intl ? new IlcIntl(this.adapter.intl) : null;
    }

    unmount() {
        if (this.intl) {
            this.intl.unmount();
        }
    }
}
