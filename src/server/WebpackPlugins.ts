export function WebpackPluginsFactory(jsFilesTest = /\.js$/) {
    const WrapperPlugin = require('wrapper-webpack-plugin');

    return [
        new WrapperPlugin({
            test: jsFilesTest, // only wrap output of bundle files with '.js' extension
            header: '(function(define, window, location){\n',
            footer:
                '\n})((window.ILC && window.ILC.define) || window.define, window.ILC.window || window, window.ILC.window ? window.ILC.window.location : window.location);',
        }),
    ];
}
