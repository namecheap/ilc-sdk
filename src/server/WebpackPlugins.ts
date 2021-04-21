import { FactoryConfig } from './types';

/* istanbul ignore file */

const defaultConf: FactoryConfig = {
    jsFilesTest: /\.js$/,
    publicPathDetection: {
        disable: false,
    },
};

/**
 * This function allows you to simplify Webpack configuration for Apps/Parcels that work with ILC.
 * It's main features:
 * - Automatic compatibility with legacy UMD bundles. More details [available here](https://github.com/namecheap/ilc/blob/master/docs/umd_bundles_compatibility.md)
 * - Automatic [public path](https://webpack.js.org/guides/public-path/#on-the-fly) configuration for Webpack bundle.
 * [Detailed description](https://github.com/joeldenning/systemjs-webpack-interop/tree/v2.3.6#as-a-webpack-plugin).
 */
export function WebpackPluginsFactory(config: RegExp | FactoryConfig) {
    const WrapperPlugin = require('wrapper-webpack-plugin');
    const SystemJSPublicPathWebpackPlugin = require('systemjs-webpack-interop/SystemJSPublicPathWebpackPlugin');
    const _merge = require('lodash.merge');

    if (config instanceof RegExp) {
        config = {
            jsFilesTest: config,
        };
    }

    const conf: FactoryConfig = _merge({}, defaultConf, config);

    const plugins = [
        new WrapperPlugin({
            test: conf.jsFilesTest, // only wrap output of bundle files with '.js' extension
            header: '(function(define){\n',
            footer: '\n})((window.ILC && window.ILC.define) || window.define);',
        }),
    ];

    if (conf.publicPathDetection && conf.publicPathDetection.disable) {
        return plugins;
    }

    plugins.push(new SystemJSPublicPathWebpackPlugin({ ...conf.publicPathDetection }));

    return plugins;
}
