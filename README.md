# App development SDK for ILC
[![NPM package](https://badgen.net/npm/v/ilc-sdk?color=red&icon=npm&label=)](https://www.npmjs.com/package/ilc-sdk)
[![NPM downloads](https://badgen.net/npm/dt/ilc-sdk)](https://www.npmjs.com/package/ilc-sdk)

SDK intended for use inside Micro Frontends to conveniently communicate with Isomorphic Layout Composer.

## Installation

```bash
$ npm i ilc-sdk
```

## Documentation

* JS docs https://namecheap.github.io/ilc-sdk/
* Additional materials
    * [ILC to App interface](https://namecheap.github.io/ilc-sdk/pages/Pages/ilc_app_interface.html)
    * [ILC Global API](https://namecheap.github.io/ilc-sdk/pages/Pages/global_api.html)

## Node.js and app bundles

This package features 2 bundles that are intended to be used in Node.js app that runs SSR bundle of your app and
the application itself.

### Node.js bundle

It works only in Node.js and is designed to parse requests from ILC and form responses. It also provides adapter for application 
bundle to work in Node.js environment.

- How to use: 
    - For apps: `const IlcSdk = require('ilc-sdk').default;` ([Documentation](https://namecheap.github.io/ilc-sdk/classes/server.ilcsdk.html))
    - For App Wrappers: `const { IlcAppWrapperSdk } = require('ilc-sdk');` ([Documentation](https://namecheap.github.io/ilc-sdk/classes/server.ilcappwrappersdk.html))

**Vue.js example:**
```javascript
const fs = require('fs');
const express = require('express');
const server = express();

const {createBundleRenderer} = require('vue-server-renderer');
const bundle = require('./dist/vue-ssr-server-bundle.json');
const clientManifest = require('./dist/vue-ssr-client-manifest.json');
const appAssets = {
    spaBundle: clientManifest.all.find(v => v.endsWith('.js')),
    cssBundle: clientManifest.all.find(v => v.endsWith('.css'))
};

const IlcSdk = require('ilc-sdk').default;
const ilcSdk = new IlcSdk({ publicPath: clientManifest.publicPath });

const renderer = createBundleRenderer(bundle, {
    template: fs.readFileSync('./index.template.html', 'utf-8'),
    clientManifest: clientManifest,
    runInNewContext: false,
    inject: false
});

server.get('/_ilc/assets-discovery', (req, res) => ilcSdk.assetsDiscoveryHandler(req, res, appAssets));

server.get('*', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    
    const ilcData = ilcSdk.processRequest(req);

    const context = {
        ilcData,
        url: ilcData.getCurrentReqUrl(),
    };

    renderer.renderToString(context, (err, html) => {
        if (err) {
            // ...
            return;
        } 
        
        ilcSdk.processResponse(ilcData, res, {
            pageTitle: context.meta.inject().title.text(),
            pageMetaTags: context.meta.inject().meta.text(),
            appAssets,
        });
        res.send(html);
    });

});
```

### Application bundle

Provides SDK that should be used within your application bundle. It works well with server and client side rendering.

- How to use: `import IlcAppSdk from 'ilc-sdk/app';`
- Documentation [is available via this link](https://namecheap.github.io/ilc-sdk/classes/app.ilcappsdk.html).