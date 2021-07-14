import * as clientTypes from '../app/interfaces/common';

/**
 * Result of the "processRequest" method
 */
export interface RequestData<RegistryProps = unknown> extends clientTypes.AppSdkAdapter {
    getCurrentReqHost: () => string;
    /** Returns original URI that is present in the actual HTTP request. It DOES NOT contain information about locale. */
    getCurrentReqUrl: () => string;
    /** Returns base path that is relative to the matched route. See README for more info. */
    getCurrentBasePath: () => string;
    /** Returns original URI that is present in the actual HTTP request. It may contain information about locale. */
    getCurrentReqOriginalUri: () => string;
    /** Returns _Props_ that were assigned to app in ILC Registry for the current path */
    getCurrentPathProps: () => RegistryProps;
    intl: clientTypes.IntlAdapter;
}

/**
 * ## Interface for application assets definition.
 *
 * All links specified within it's properties can be rather absolute or relative.
 * If there was an absolute link specified - defaultPublicPath will be used or "publicPath" application property.
 */
export interface AppAssets {
    /** URL to the JS application bundle */
    spaBundle: string;
    /** URL to the CSS application file */
    cssBundle?: string;
    /** Key value map with application dependencies. Where key is the name of the SystemJS library and value is a URL to it. */
    dependencies?: { [key: string]: string };
}

/**
 * Data passed to "processResponse" method
 */
export interface ResponseData {
    appAssets?: AppAssets;
    /** Title that should be applied to the page. Works only for primary applications. */
    pageTitle?: string;
    /** Meta tags list in a form of HTML string that should be applied to the page. Works only for primary applications. */
    pageMetaTags?: string;
}

export interface WrapperResponseData {
    /** Props which will override values returned by getCurrentPathProps() for target app */
    propsOverride: { [key: string]: any };
}

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

export interface Logger {
    info(logInfo: Record<string, any> | string): void;
    warn(logInfo: Record<string, any> | string): void;
    debug(logInfo: Record<string, any> | string): void;
    error(logInfo: Record<string, any> | string): void;
}
