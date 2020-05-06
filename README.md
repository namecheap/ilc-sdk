# Server side SDK for ILC
Server side SDK intended for use inside Micro Frontends to conveniently communicate with Isomorphic Layout Composer.

## Quick start

Vue.js example: 
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

const IlcSdk = require('ilc-server-sdk').default;
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

## JS docs

See https://namecheap.github.io/ilc-server-sdk/