# App development SDK for ILC

[![NPM package](https://badgen.net/npm/v/ilc-sdk?color=red&icon=npm&label=)](https://www.npmjs.com/package/ilc-sdk)
[![NPM downloads](https://badgen.net/npm/dt/ilc-sdk)](https://www.npmjs.com/package/ilc-sdk)

SDK intended for use inside Micro Frontends to conveniently communicate with Isomorphic Layout Composer.

## Installation

```bash
$ npm i ilc-sdk
```

## Documentation

-   JS docs https://namecheap.github.io/ilc-sdk/
-   Additional materials
    -   [ILC to App interface](https://namecheap.github.io/ilc-sdk/pages/Pages/ilc_app_interface.html)
    -   [ILC Global API](https://namecheap.github.io/ilc-sdk/pages/Pages/global_api.html)
    -   [Registry API](https://namecheap.github.io/ilc-sdk/pages/Pages/registry_api.html)
    -   [Public Path Problem](https://namecheap.github.io/ilc-sdk/pages/Pages/public_path.html)

## Node.js and App entrypoints

This package features 2 bundles that are intended to be used in Node.js app that runs SSR bundle of your app and
the application itself.

-   Node.js server bundle - [documentation](https://namecheap.github.io/ilc-sdk/modules/server.html)
-   Application bundle - [documentation](https://namecheap.github.io/ilc-sdk/modules/app.html)

## Contribution

-   Commit messages must follow the [conventional commits specification](https://www.conventionalcommits.org/en/v1.0.0/#specification)
-   This library follows [semantic versioning](https://semver.org/)
