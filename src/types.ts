export interface RequestData {
    getCurrentReqUrl: () => string;
    getCurrentBasePath: () => string;
    getCurrentPathProps: () => object;
}

export interface AppAssets {
    spaBundle: string;
    cssBundle?: string;
    dependencies?: { [key: string]: string };
}

export interface ResponseData {
    appAssets?: AppAssets;
    pageTitle?: string;
    pageMetaTags?: string;
}
