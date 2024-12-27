import UglifyJs from 'uglify-js';
import InjectPlugin, { ENTRY_ORDER } from 'webpack-inject-plugin';

import { BannerPlugin, WebpackPluginInstance } from 'webpack';
import resolveDirectory from '../app/utils/resolveDirectory';
import { publicPathTpl } from './constants';
import { FactoryConfig } from './types';

/* istanbul ignore file */

const defaultConf: FactoryConfig = {
    jsFilesTest: /\.js$/,
    publicPathDetection: {
        disable: false,
        rootDirectoryLevel: 1,
        ssrPublicPath: publicPathTpl,
    },
};

type FactoryResult = {
    client: WebpackPluginInstance[];
    server: WebpackPluginInstance[];
};

/**
 * This function allows you to simplify client side Webpack configuration for Apps/Parcels that work with ILC.
 * It's main features:
 * - Automatic compatibility with legacy UMD bundles. More details [available here](https://github.com/namecheap/ilc/blob/master/docs/umd_bundles_compatibility.md)
 * - Automatic public path configuration for Webpack bundle.
 * [Detailed description](https://namecheap.github.io/ilc-sdk/pages/Pages/public_path.html).
 */
export function WebpackPluginsFactory(config: RegExp | FactoryConfig = {}): FactoryResult {
    if (config instanceof RegExp) {
        config = {
            jsFilesTest: config,
        };
    }

    const conf: FactoryConfig = {
        ...defaultConf,
        ...config,
        publicPathDetection: { ...defaultConf.publicPathDetection, ...config.publicPathDetection },
    };

    const plugins: FactoryResult = {
        client: [
            new BannerPlugin({
                test: conf.jsFilesTest, // only wrap output of bundle files with '.js' extension
                banner: '(function(define){const __ilc_script_url__ = document.currentScript.src;',
                raw: true,
            }),
            new BannerPlugin({
                test: conf.jsFilesTest, // only wrap output of bundle files with '.js' extension
                banner: '})((window.ILC && window.ILC.define) || window.define);',
                raw: true,
                footer: true,
            }),
        ],
        server: [],
    };

    if (conf.publicPathDetection && conf.publicPathDetection.disable) {
        return plugins;
    }

    plugins.client.push(
        new InjectPlugin(
            () => {
                const minifiedCode = UglifyJs.minify(resolveDirectory.toString()).code;
                return `${minifiedCode}
            __webpack_public_path__  = resolveDirectory(__ilc_script_url__, ${conf.publicPathDetection?.rootDirectoryLevel});`;
            },
            { entryOrder: ENTRY_ORDER.First },
        ),
    );

    plugins.server.push(
        new InjectPlugin(
            () => `
        const pp = \`${conf.publicPathDetection!.ssrPublicPath}\`;
        if (!pp) {
            throw new Error('IlcSdk: Unable to determine public path of the application');
        }
        __webpack_public_path__  = pp;`,
            { entryOrder: ENTRY_ORDER.First },
        ),
    );

    return plugins;
}
