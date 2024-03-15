import UglifyJs from 'uglify-js';
import webpack from 'webpack'

import { FactoryConfig } from './types';
import resolveDirectory from '../app/utils/resolveDirectory';
import { publicPathTpl } from './constants';

/* istanbul ignore file */

const defaultConf: FactoryConfig = {
    jsFilesTest: /\.js$/,
    publicPathDetection: {
        disable: false,
        rootDirectoryLevel: 1,
        ssrPublicPath: publicPathTpl,
    },
};

/**
 * This function allows you to simplify client side Webpack configuration for Apps/Parcels that work with ILC.
 * It's main features:
 * - Automatic compatibility with legacy UMD bundles. More details [available here](https://github.com/namecheap/ilc/blob/master/docs/umd_bundles_compatibility.md)
 * - Automatic public path configuration for Webpack bundle.
 * [Detailed description](https://namecheap.github.io/ilc-sdk/pages/Pages/public_path.html).
 */
export function WebpackPluginsFactory(config: RegExp | FactoryConfig = {}) {
    const WrapperPlugin = require('wrapper-webpack-plugin');
    const _merge = require('lodash.merge');

    if (config instanceof RegExp) {
        config = {
            jsFilesTest: config,
        };
    }

    const conf: FactoryConfig = _merge({}, defaultConf, config);

    const plugins = {
        client: [
            new WrapperPlugin({
                test: conf.jsFilesTest, // only wrap output of bundle files with '.js' extension
                header: '(function(define){const __ilc_script_url__ = document.currentScript.src;\n',
                footer: '\n})((window.ILC && window.ILC.define) || window.define);',
            }),
        ],
        server: [] as any[],
    };

    if (conf.publicPathDetection && conf.publicPathDetection.disable) {
        return plugins;
    }

    const client = () => {
        const minifiedCode = UglifyJs.minify(resolveDirectory.toString()).code;
        return `${minifiedCode}
    __webpack_public_path__  = resolveDirectory(__ilc_script_url__, ${conf.publicPathDetection?.rootDirectoryLevel});`;
    }

    plugins.client.push(
        new webpack.BannerPlugin({
            banner: client
        })
    );

    const server = () => `
    const pp = \`${conf.publicPathDetection!.ssrPublicPath}\`;
    if (!pp) {
        throw new Error('IlcSdk: Unable to determine public path of the application');
    }
    __webpack_public_path__  = pp;`

    plugins.server.push(
        new webpack.BannerPlugin({
            banner: server
        })
    );

    return plugins;
}
