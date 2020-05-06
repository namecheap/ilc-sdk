import { IncomingMessage, ServerResponse } from 'http';
import * as path from 'path';
import * as types from './types';
import urljoin from 'url-join';

export * from './types';

export default class IlcSdk {
    private log: Console;
    private defaultPublicPath: string;
    private titleRegex = /<title\s*>.*<\/title\s*>/s;
    private publicPathProperyName: string;

    constructor({ logger = console, publicPath = '/', publicPathProperyName = 'publicPath' } = {}) {
        this.log = logger;
        this.defaultPublicPath = publicPath;
        this.publicPathProperyName = publicPathProperyName;
    }

    /**
     * Processes incoming request and returns object that can be used to fetch information passed by ILC to the application.
     */
    public processRequest(req: IncomingMessage): types.RequestData {
        const url = this.parseUrl(req);
        const requestedUrls = this.getRequestUrls(url);
        const passedProps = this.getPassedProps(url);

        return {
            getCurrentReqUrl: () => requestedUrls.requestUrl,
            getCurrentBasePath: () => requestedUrls.basePageUrl,
            getCurrentPathProps: () => passedProps,
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

    private getRequestUrls(url: URL) {
        const res = {
            // Base path used for links on the page, should be relative. Can be ignored if memory routing is in use
            // More info: https://collab.namecheap.net/x/myZdCw
            // https://github.com/ReactTraining/history/blob/3f69f9e07b0a739419704cffc3b3563133281548/docs/Misc.md#using-a-base-url
            basePageUrl: '/',
            requestUrl: '/', // basePageUrl should be deducted from it
        };

        if (url.searchParams.has('routerProps')) {
            const routerProps = JSON.parse(
                Buffer.from(url.searchParams.get('routerProps')!, 'base64').toString('utf-8'),
            );

            res.basePageUrl = routerProps.basePath;
            res.requestUrl = '/' + path.relative(routerProps.basePath, routerProps.reqUrl);
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
