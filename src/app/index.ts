import * as types from './types';
import IlcIntl from './IlcIntl';

export * from './types';

export const Intl = IlcIntl;

/**
 * Entrypoint for SDK that should be used within application bundle
 */
export default class IlcAppSdk {
    private adapter: types.ClientSdkAdapter;
    public intl: IlcIntl | null;

    constructor(adapter?: types.ClientSdkAdapter) {
        if (adapter) {
            this.adapter = adapter;
        } else if ((window as any).ILC) {
            this.adapter = (window as any).ILC.clientSdkAdapter as types.ClientSdkAdapter;
        } else {
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
