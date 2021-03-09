/* istanbul ignore file */

export interface FactoryConfig {
    jsFilesTest?: RegExp;
    publicPathDetection?: {
        disable?: boolean;
        /**
         * If you need the webpack public path to "chop off" some of the directories in the current module's url, you can specify a "root directory level". Note that the root directory level is read from right-to-left, with `1` indicating "current directory" and `2` indicating "up one directory":
         * optional: defaults to 1
         */
        rootDirectoryLevel?: number;
        /**
         * ONLY NEEDED FOR WEBPACK 1-4. Not necessary for webpack@5
         * example: @portal/appName
         */
        systemjsModuleName?: string;
    };
}

const defaultConf: FactoryConfig = {
    jsFilesTest: /\.js$/,
    publicPathDetection: {
        disable: false,
    },
};

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
