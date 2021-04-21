/**
 * Entrypoint Node.js SDK and is designed to parse server requests from ILC and form responses. It also provides an adapter for application
 * bundle to work in Node.js environment.
 *
 *
 * - How to use:
 *     - For apps: `const IlcSdk = require('ilc-sdk').default;` ({@link IlcSdk | Documentation})
 *     - For App Wrappers: `const { IlcAppWrapperSdk } = require('ilc-sdk');`
 *     ({@link IlcAppWrapperSdk | Documentation}, [Code example](https://github.com/namecheap/ilc-demo-apps/blob/124f373492713d5b0f38c776ac7041c5d9c0bb50/apps/wrapper/server.js#L34-L45))
 *
 * ### Webpack plugins factory
 * This entrypoint also exposes {@link WebpackPluginsFactory} which allows you to simplify Webpack configuration for Apps/Parcels that work with ILC.
 * See more information by the link from above.
 *
 * ### Code examples from demo apps:
 * - [React](https://github.com/namecheap/ilc-demo-apps/blob/124f373492713d5b0f38c776ac7041c5d9c0bb50/apps/navbar/server.js#L36)
 * - [Vue.js](https://github.com/namecheap/ilc-demo-apps/blob/124f373492713d5b0f38c776ac7041c5d9c0bb50/apps/news-ssr/server.js#L22-L27)
 *
 * @example Vue.js sample
 * ```javascript
 * const fs = require('fs');
 * const express = require('express');
 * const server = express();
 *
 * const {createBundleRenderer} = require('vue-server-renderer');
 * const bundle = require('./dist/vue-ssr-server-bundle.json');
 * const clientManifest = require('./dist/vue-ssr-client-manifest.json');
 * const appAssets = {
 *    spaBundle: clientManifest.all.find(v => v.endsWith('.js')),
 *    cssBundle: clientManifest.all.find(v => v.endsWith('.css'))
 * };
 *
 * const IlcSdk = require('ilc-sdk').default;
 * const ilcSdk = new IlcSdk({ publicPath: clientManifest.publicPath });
 *
 * const renderer = createBundleRenderer(bundle, {
 *    template: fs.readFileSync('./index.template.html', 'utf-8'),
 *    clientManifest: clientManifest,
 *    runInNewContext: false,
 *    inject: false
 * });
 *
 * server.get('/_ilc/assets-discovery', (req, res) => ilcSdk.assetsDiscoveryHandler(req, res, appAssets));
 *
 * server.get('*', (req, res) => {
 *    res.setHeader('Content-Type', 'text/html');
 *
 *    const ilcData = ilcSdk.processRequest(req);
 *
 *    const context = {
 *        ilcData,
 *        url: ilcData.getCurrentReqUrl(),
 *    };
 *
 *    renderer.renderToString(context, (err, html) => {
 *        if (err) {
 *            // ...
 *            return;
 *        }
 *
 *        ilcSdk.processResponse(ilcData, res, {
 *            pageTitle: context.meta.inject().title.text(),
 *            pageMetaTags: context.meta.inject().meta.text(),
 *            appAssets,
 *        });
 *        res.send(html);
 *    });
 *
 * });
 * ```
 *
 * @module
 */

import { IlcSdk } from './IlcSdk';

export * from './types';
export * from './WebpackPlugins';
export * from './IlcAppWrapperSdk';
export default IlcSdk;
