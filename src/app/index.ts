/**
 * Entrypoint for SDK that should be used within application bundle. It works well with server and client side rendering.
 *
 *
 *
 * ## Client side
 * At client side your app receives instance of the {@link IlcAppSdk} via props that are passed to it's lifecycle functions ({@link LifeCycles}).
 * So everything is pretty simple here :) Typings can be loaded in the following way:
 *
 * @example
 * ```
 * import IlcAppSdk from 'ilc-sdk/app';
 * ```
 *
 * ## Server side
 * Unfortunately during app's SSR we don't have ILC in place.
 * So we need to use result of the {@link IlcSdk.processRequest} (which implements {@link AppSdkAdapter}) to receive all the necessary
 * data for `IlcAppSdk` initialization.
 *
 * @example
 * ```
 * const IlcSdk = require('ilc-sdk').default;
 * const IlcAppSdk = require('ilc-sdk/app').default;
 *
 * const ReactDOMServer = require('react-dom/server');
 * const {default: App} = require('./build/server');
 *
 * server.get('*', (req, res) => {
 *     const ilcReqData = ilcSdk.processRequest(req);
 *     const appSdk = new IlcAppSdk(ilcReqData);
 *
 *     const html = ReactDOMServer.renderToString(App(appSdk));
 *
 *     res.send(html);
 * });
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
