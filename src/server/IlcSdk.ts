import { IncomingMessage, ServerResponse } from 'http';
import * as types from './types';
import urljoin from 'url-join';
import { intlSchema } from './IlcProtocol';
import defaultIntlAdapter from '../app/defaultIntlAdapter';
import * as clientTypes from '../app/interfaces/common';

/**
 * Entrypoint for SDK that should be used within application server that executes SSR bundle
 */
export class IlcSdk {
    private log: Console;
    private defaultPublicPath: string;
    private titleRegex = /<title.*>.*<\/title\s*>/s;
    private publicPathProperyName: string;

    /**
     *
     * @param options
     * @param options.logger
     *
     *   **Default value:** `console`
     * @param options.publicPath Default value that will be used if no "publicPath" were defined in app's props inside ILC Registry.
     *
     *  **Default value:** `/`
     *
     * @param options.publicPathProperyName Allows to use other then `publicPath` key for the property that will be used to determine micro frontend's public path.
     *
     *  **Default value:** `publicPath`
     */
    constructor(options: { logger?: Console; publicPath?: string; publicPathProperyName?: string } = {}) {
        this.log = options.logger || console;
        this.defaultPublicPath = options.publicPath || '/';
        this.publicPathProperyName = options.publicPathProperyName || 'publicPath';
    }

    /**
     * Processes incoming request and returns object that can be used to fetch information passed by ILC to the application.
     */
    public processRequest<RegistryProps = unknown>(req: IncomingMessage): types.RequestData<RegistryProps> {
        const url = this.parseUrl(req);
        const routerProps = this.parseRouterProps(url);
        const requestedUrls = this.getRequestUrls(url, routerProps);
        const passedProps = this.getPassedProps(url);

        let appId: string;
        if (routerProps.fragmentName) {
            appId = routerProps.fragmentName;
        } else {
            appId = 'dumbId';
            this.log.warn(`Missing "appId" information for "${url.href}" request. Falling back to dumb ID.`);
        }

        let host = req.headers['x-request-host'] as string;
        if (host === undefined) {
            this.log.warn(
                `Missing "x-request-host" information for "${url.href}" request. Falling back to "localhost".`,
            );
            host = 'localhost';
        }

        let originalUri = req.headers['x-request-uri'] as string;
        if (originalUri === undefined) {
            this.log.warn(`Missing "x-request-uri" information for "${url.href}" request. Falling back to "/".`);
            originalUri = '/';
        }

        return {
            getCurrentReqHost: () => host,
            getCurrentReqUrl: () => requestedUrls.requestUrl,
            getCurrentBasePath: () => requestedUrls.basePageUrl,
            getCurrentReqOriginalUri: () => originalUri,
            getCurrentPathProps: () => passedProps,
            appId,
            intl: this.parseIntl(req),
        };
    }

    /**
     * Processes outgoing response and allow conveniently pass information from application back to ILC.
     *
     * **WARNING:** this method should be called before response headers were send.
     */
    public processResponse(reqData: types.RequestData, res: ServerResponse, data?: types.ResponseData): void {
        if (!data) {
            return;
        }
        if (res.headersSent) {
            throw new Error('Unable to set all necessary headers as they were already sent');
        }
        if (data.pageTitle) {
            let title = data.pageTitle;
            if (!this.titleRegex.test(data.pageTitle)) {
                title = `<title>${title}</title>`;
            }
            res.setHeader('x-head-title', Buffer.from(title, 'utf8').toString('base64'));
        }
        if (data.pageMetaTags) {
            res.setHeader('x-head-meta', Buffer.from(data.pageMetaTags, 'utf8').toString('base64'));
        }
        if (data.appAssets) {
            const publicPath = (reqData.getCurrentPathProps() as any)[this.publicPathProperyName];
            res.setHeader('Link', this.getLinkHeader(data.appAssets, publicPath));
        }

        res.setHeader('content-type', 'text/html');
    }

    /**
     * Correctly responds to ILC for the assets discovery request.
     *
     * **WARNING:** this method should never be used in production if application is running in more than a single instance
     */
    public assetsDiscoveryHandler(req: IncomingMessage, res: ServerResponse, appAssets: types.AppAssets) {
        const url = this.parseUrl(req);
        const publicPath = this.getPassedProps(url)[this.publicPathProperyName];

        const resData: any = {
            spaBundle: this.buildLink(appAssets.spaBundle, publicPath),
            dependencies: {},
        };
        if (appAssets.cssBundle) {
            resData.cssBundle = this.buildLink(appAssets.cssBundle, publicPath);
        }
        if (appAssets.dependencies) {
            for (const k in appAssets.dependencies) {
                /* istanbul ignore if */
                if (!appAssets.dependencies.hasOwnProperty(k)) {
                    continue;
                }

                resData.dependencies[k] = this.buildLink(appAssets.dependencies[k], publicPath);
            }
        }

        res.statusCode = 200;
        res.setHeader('content-type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(resData));
    }

    private parseIntl(req: IncomingMessage): clientTypes.IntlAdapter {
        const intlParams = req.headers['x-request-intl'] as string | undefined;
        if (intlParams === undefined) {
            return defaultIntlAdapter;
        }

        let ilcData: any;
        try {
            ilcData = intlSchema.fromBuffer(Buffer.from(intlParams, 'base64'), undefined, true);
        } catch {
            return defaultIntlAdapter;
        }

        return {
            get: () => ilcData.current,
            config: {
                default: ilcData.default,
                supported: ilcData.supported,
                routingStrategy: ilcData.routingStrategy,
            },
        };
    }

    private parseRouterProps(url: URL) {
        if (url.searchParams.has('routerProps')) {
            return JSON.parse(Buffer.from(url.searchParams.get('routerProps')!, 'base64').toString('utf-8'));
        } else {
            return {};
        }
    }

    private getRequestUrls(url: URL, routerProps: any) {
        const res = {
            // Base path used for links on the page, should be relative. Can be ignored if memory routing is in use
            // More info: https://collab.namecheap.net/x/myZdCw
            // https://github.com/ReactTraining/history/blob/3f69f9e07b0a739419704cffc3b3563133281548/docs/Misc.md#using-a-base-url
            basePageUrl: '/',
            requestUrl: '/', // basePageUrl should be deducted from it
        };

        if (routerProps.basePath && routerProps.reqUrl) {
            res.basePageUrl = routerProps.basePath;
            res.requestUrl = urljoin('/', routerProps.reqUrl.replace(routerProps.basePath, ''));
        } else {
            this.log.warn(`Missing "routerProps" for "${url.href}" request. Fallback to / & /`);
        }

        return res;
    }

    private getPassedProps(url: URL) {
        if (!url.searchParams.has('appProps')) {
            return {};
        }

        try {
            return JSON.parse(Buffer.from(url.searchParams.get('appProps')!, 'base64').toString('utf-8'));
        } catch (e) {
            this.log.warn(`Error while parsing passed props. Falling back to empty object...`, e);

            return {};
        }
    }

    private parseUrl(req: IncomingMessage) {
        return new URL(req.url!, `http://${req.headers.host}`);
    }

    private getLinkHeader(appAssets: types.AppAssets, publicPath?: string) {
        const links = [
            `<${this.buildLink(
                appAssets.spaBundle,
                publicPath,
            )}>; rel="fragment-script"; as="script"; crossorigin="anonymous"`,
        ];

        if (appAssets.cssBundle) {
            links.push(`<${this.buildLink(appAssets.cssBundle, publicPath)}>; rel="stylesheet"`);
        }

        for (const k in appAssets.dependencies) {
            /* istanbul ignore if */
            if (!appAssets.dependencies.hasOwnProperty(k)) {
                continue;
            }

            links.push(
                `<${this.buildLink(appAssets.dependencies[k], publicPath)}>; rel="fragment-dependency"; name="${k}"`,
            );
        }

        return links.join(',');
    }

    private buildLink(url: string, publicPath?: string) {
        if (url.includes('http://') || url.includes('https://')) {
            return url;
        }

        const pp = publicPath ? publicPath : this.defaultPublicPath;

        return urljoin(pp, url);
    }
}
