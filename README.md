# Server side SDK for ILC
[![NPM package](https://badgen.net/npm/v/ilc-server-sdk?color=red&icon=npm&label=)](https://www.npmjs.com/package/ilc-server-sdk)
[![NPM downloads](https://badgen.net/npm/dt/ilc-server-sdk)](https://www.npmjs.com/package/ilc-server-sdk)

Server side SDK intended for use inside Micro Frontends to conveniently communicate with Isomorphic Layout Composer.

## Installation

```bash
$ npm i ilc-server-sdk
```

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


/////


import IlcAppSdk from 'ilc-server-sdk/dist/client';

//SSR
const intl = new IlcAppSdk(context.ilcData);

//CSR
const intl = new IlcAppSdk(window.ILC.intl);
```

## JS docs

See https://namecheap.github.io/ilc-server-sdk/


## Low level ILC <-> Micro Frontend interface

This is the description of the server side ILC <-> Micro Frontend interface which is implemented by this library in a form
of SDK.

### Input interface ILC -> Micro Frontend
With every request for SSR content from the app ILC sends the following meta-information:
1. Query parameter `routerProps`

   Contains base64 encoded JSON object with the following keys:
   * `basePath` - Base path that is relative to the matched route.
   
       So for `reqUrl = /a/b/c?d=1` & matched route `/a/*` base path will be `/a/`.
       While for `reqUrl = /a/b/c?d=1` & matched route `/a/b/c` base path will be `/a/b/c`.
   * `reqUrl` - Request URL string. This contains only the URL that is present in the actual HTTP request. It **DOES NOT** contain information about locale.
       
       `reqUrl` = `/status?name=ryan` if the request is:
       ```
       GET /status?name=ryan HTTP/1.1\r\n
       Accept: text/plain\r\n
       \r\n
       ```
   * _(legacy)_ `fragmentName` - string with name of the fragment
1. Query parameter `appProps`
  
   Sent only if app has some _Props_ defined at the app or route slot level.
   Contains base64 encoded JSON object with defined _Props_.
  
1. Header `x-request-uri`. Request URL string. This contains only the URL that is present in the actual HTTP request. It **may contain** information about locale.

1. Optional header `x-request-intl`. Present only if ILC runs with Intl feature enabled. Format: 
    ```
    `<current locale>:<default locale>:<supported locale>[,<supported locale>];<current currency>:<default currency>:<supported currency>[,<supported currency>]`;
    ```

Both query params mentioned here can be decoded in the following manner:
```javascript
JSON.parse(Buffer.from(req.query.routerProps, 'base64').toString('utf-8'))
```

### Response interface Micro Frontend -> ILC

App possible response headers:

* `Link` - Check [reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Link).
* `x-head-title` - _(only primary app)_ Page title encoded with base64. Will be injected onto `<head>` tag.
Ex: `Buffer.from('<title>Page title</title>', 'utf-8').toString('base64')`
* `x-head-meta` - _(only primary app)_ Page [meta tags](https://www.w3schools.com/tags/tag_meta.asp) encoded with base64.
Ex: `Buffer.from('<meta name="description" content="Free Web tutorials"><meta name="keywords" content="HTML,CSS,XML,JavaScript">', 'utf-8').toString('base64')`

HTTP status code from the primary app will be used to define HTTP status code of the requested page.
