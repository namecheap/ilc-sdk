# Public Path Problem

Usually in micro-frontends environment you have each app deployed separately and so
assets for different apps reside under different base public URLs.

Let's imagine that we have App1 and App2 and we deploy their assets to CDN `https://cdn.com`.
This can bring us to the following files structure at CDN:
```
- app1
  |- main.a34gf.js
  |- chunk0.nvfg4.js
  |- main.fg45s.css
  |- assets
     |- logo.df45.png
- app2
  |- main.wgr5a.js
  |- chunk0.sdt54.js
  |- main.jh63g.css
  |- assets
     |- logo.df45.png     
```

Considering that it's not the best practice to hardcode absolute URLs right within JS/CSS bundle 
(as it makes built code environment dependent) - we need to keep only relative URLs in the bundle and [supply basic
public path URL at runtime](https://webpack.js.org/guides/public-path/#on-the-fly).

In our example App1 should receive `https://cdn.com/app1/` while App2 requires `https://cdn.com/app2/` to function 
correctly.

## Tricky SSR

Fortunately modern Webpack 5 supports [automatic detection](https://webpack.js.org/guides/public-path/#automatic-publicpath) of the public path at runtime (based on the URL of the JS file).
Or similar can be achieved with the use of [SystemJSPublicPathWebpackPlugin](https://github.com/joeldenning/systemjs-webpack-interop#as-a-webpack-plugin).

However, all those approaches does not support SSR. All of them use URL of the currently executed JS file in order to 
try to determine public path of the bundle, and you simply don't have that data available during SSR.

## Why Public Path is important

There are several reasons we need it to be set correctly, here are some of them.

**Client side rendering**

* Generation of the links to static assets (images, fonts, audio, video) imported into bundle and then extracted to separate files via `file-loader`.
* Dynamic loading of the bundle chunks when using [code splitting](https://webpack.js.org/guides/code-splitting/).

**Server side rendering**

* Generation of the links to static assets (images, fonts, audio, video) imported into bundle and then extracted to separate files via `file-loader`.
* Synchronization of the CSR/SSR JS bundle to make sure that we use matching pair of the CSR & SSR code.

## Recommended solution from ILC

### Client side bundle configuration

All you need to do to configure public path for your CSR bundle - is to use `WebpackPluginsFactory` from [ILC SDK](https://github.com/namecheap/ilc-sdk).

```javascript
// webpack.js
const ilcWebpackPluginsFactory = require('ilc-sdk').WebpackPluginsFactory;

module.exports = {
    entry: 'src/client.entry.js',
    output: {
        filename: 'app.js',
        libraryTarget: 'system',
    },
    module: { /* ... */ },
    plugins: ilcWebpackPluginsFactory().client,
};
```

This plugin will set bundle's public path automatically using current URL of the JS file. So if main chunk of your JS bundle
has URL `https://cdn.com/teamA/app1/index.fhg3r.js` - public path will be `https://cdn.com/teamA/app1/`.

If you need have JS bundle at `https://cdn.com/app1/js/index.fhg3r.js` and want public path to equal `https://cdn.com/app1/` - 
pass the following props to the [ilcWebpackPluginsFactory](https://namecheap.github.io/ilc-sdk/modules/server.html#webpackpluginsfactory):

```javascript
ilcWebpackPluginsFactory({
    publicPathDetection: {
        rootDirectoryLevel: 2
    }
}).client
```

### Server side bundle configuration

Unfortunately it's virtually impossible to provide consistent with CSR solution that would work with every framework/use case. So for now we've decided to
step away of the CSR/SSR consistent solution and use Node.js app environment variables as a source of public path for SSR bundle.

It works by setting `ILC_APP_PUBLIC_PATH` environment variable to the process in which you execute your SSR.

This variable will be picked up by code injected by `ilcWebpackPluginsFactory().server` Webpack plugins.
To make it work - you need to do the following:

```javascript
// webpack.server.js
const ilcWebpackPluginsFactory = require('ilc-sdk').WebpackPluginsFactory;
const path = require('path');


const config = require('./webpack.js');

config.entry = 'src/server.entry.js';
config.target = 'node';
config.output.filename = 'server.js';
config.output.libraryTarget = 'commonjs2';

config.plugins = ilcWebpackPluginsFactory().server;
config.externals = [];

module.exports = config;
```

It's up to the App developers to choose how to deliver value of the `ILC_APP_PUBLIC_PATH` environment variable to the app process.

Also there is an option to customize construction of the public path from the env variable. It's useful when you run dozens of apps
which store their assets at the same CDN. To achieve that - pass the following parameters to `ilcWebpackPluginsFactory`:

```javascript
ilcWebpackPluginsFactory({
    publicPathDetection: {
        ssrPublicPath: 'https://${process.env.CDN_DOMAIN}/app-folder/'
    }
}).server;
```