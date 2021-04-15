# ILC to App interface

This document aims to describe communication interface used by ILC
to talk to apps (micro frontends).

## Client side interface

During the course of a single-spa page, registered applications are loaded, bootstrapped (initialized), mounted, unmounted, and unloaded.
ILC (with the help of the [single-spa](https://single-spa.js.org/)) provides hooks into each phase via `lifecycles`.

See more information about the [lifecycle functions here](https://single-spa.js.org/docs/building-applications/#lifecyle-props).

TS interface for custom props that are passed to every lifecycle function 
[can be found here](https://namecheap.github.io/ilc-sdk/interfaces/app.applifecyclefnprops.html).



### Init code during app bundle loading

Sometimes you need to run some initialization code right after app bundle will be loaded in the browser and usually you
want to be able to pass some configuration properties to that code.

ILC allows you to export a function called `mainSpa(props)` that will receive application properties that were defined in
_Registry_ in it's first argument.
This function should return an object with "single-spa" [lifecycle functions](https://single-spa.js.org/docs/building-applications/#lifecyle-props).

**Example of possible use case:**
```javascript
// File specified as Webpack entry point
export const mainSpa = (props) => {
	if (props.publicPath) {
		__webpack_public_path__ = props.publicPath;
	} else {
		console.warn(`Can't determine value of the "__webpack_public_path__", falling back to default one...`);
	}

	return require('./app-bootstrap'); // Returns: {bootstrap: () => {}, mount: () => {}, unmount: () => {}}
};
```

## Server side interface

> **Note:** keep in mind that Server side interface integration is necessary only for isomorphic micro frontend. However
ILC also supports apps that have client side rendering only.

### Low level ILC <-> Micro Frontend interface

This is the description of the server side ILC <-> Micro Frontend interface which is implemented by this library in a form
of SDK.

#### Input interface ILC -> Micro Frontend
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

1. Optional header `x-request-intl`. Present only if ILC runs with Intl feature enabled. Format is described [here](src/server/IlcProtocol.ts).

Both query params mentioned here can be decoded in the following manner:
```javascript
JSON.parse(Buffer.from(req.query.routerProps, 'base64').toString('utf-8'))
```

#### Response interface Micro Frontend -> ILC

App possible response headers:

* `Link` - Check [reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Link).
* `x-head-title` - _(only primary app)_ Page title encoded with base64. Will be injected onto `<head>` tag.
  Ex: `Buffer.from('<title>Page title</title>', 'utf-8').toString('base64')`
* `x-head-meta` - _(only primary app)_ Page [meta tags](https://www.w3schools.com/tags/tag_meta.asp) encoded with base64.
  Ex: `Buffer.from('<meta name="description" content="Free Web tutorials"><meta name="keywords" content="HTML,CSS,XML,JavaScript">', 'utf-8').toString('base64')`

HTTP status code from the primary app will be used to define HTTP status code of the requested page.

##### App Wrappers

If Micro Frontend has been registered as "App Wrapper" it can respond in a special format to forward SSR request to the target
application. To do so app need to return `210` HTTP status code with following headers available:

* `x-props-override` - Props which will override values returned by getCurrentPathProps() for target app.
  Ex: `Buffer.from(JSON.stringify(propsOverride)).toString('base64'))`

See [wrapper application](https://github.com/namecheap/ilc-demo-apps/tree/master/apps/wrapper) in ILC Demo apps for
sample use of the functionality.