/**
 * Result of the "processRequest" method
 */
export interface RequestData {
    getCurrentReqUrl: () => string;
    getCurrentBasePath: () => string;
    getCurrentPathProps: () => object;
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
