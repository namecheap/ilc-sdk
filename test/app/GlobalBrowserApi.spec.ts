import { expect } from 'chai';
import { GlobalBrowserApi } from '../../src/app/GlobalBrowserApi';
import sinon from 'sinon';
import { AppLifecycleFnProps, ApplicationConfig, ApplicationKind, LifeCycleFn, LifeCycles } from '../../src/app';

describe('GlobalBrowserApi', () => {
    interface AppProps {
        appConfig: object;
    }

    const appConfig: ApplicationConfig<AppProps> = {
        name: '@portal/news',
        kind: ApplicationKind.Primary,
        spaBundle: 'http://localhost:8080/bundle.js',
        cssBundle: 'http://localhost:8080/bundle.css',
        props: {
            appConfig: {},
        },
    };

    const app: LifeCycles<AppLifecycleFnProps> = {
        bootstrap: sinon.stub(),
        mount: sinon.stub(),
        unmount: sinon.stub(),
    };

    let cleanup: Function;

    beforeEach(() => {
        cleanup = require('jsdom-global')();
        window.ILC = {
            navigate: () => 'navigate',
            importParcelFromApp: () =>
                Promise.resolve({ bootstrap: sinon.stub(), mount: sinon.stub(), unmount: sinon.stub() }),
            mountRootParcel: () => ({
                mount: sinon.stub(),
                unmount: sinon.stub(),
                getStatus: sinon.stub(),
                mountPromise: Promise.resolve(null),
                loadPromise: Promise.resolve(null),
                bootstrapPromise: Promise.resolve(null),
                unmountPromise: Promise.resolve(null),
            }),
            getAllSharedLibNames: () => Promise.resolve(['libName_1', 'libName_2']),
            loadApp: () => Promise.resolve(app),
            onIntlChange: () => null,
            onRouteChange: () => () => {},
            matchCurrentRoute: () => true,
            getIntlAdapter: () => null,
            getSharedLibConfigByName: () => Promise.resolve([]),
            getSharedLibConfigByNameSync: () => [],
            getApplicationConfigByName: <T>() => Promise.resolve(appConfig as ApplicationConfig<T>),
            unloadApp: (appId) => Promise.resolve(),
        };
    });

    /**
     * https://github.com/rstacruz/jsdom-global/issues/61
     */
    // after(() => cleanup());

    it('navigate is correctly typed and callable', () => {
        const res = GlobalBrowserApi.navigate('aaa');
        expect(res).to.eq('navigate');
    });

    it('importParcelFromApp is correctly typed and callable', async () => {
        // @ts-expect-error
        await GlobalBrowserApi.importParcelFromApp('aaa');

        const res = await GlobalBrowserApi.importParcelFromApp('aaa', 'bbb');
        expect(res.bootstrap).to.be.a('function');
        expect(res.mount).to.be.a('function');
        expect(res.unmount).to.be.a('function');
    });

    it('mountRootParcel is correctly typed and callable', async () => {
        const parcelConfig = await GlobalBrowserApi.importParcelFromApp('aaa', 'bbbb');

        // @ts-expect-error
        GlobalBrowserApi.mountRootParcel(parcelConfig, {});

        GlobalBrowserApi.mountRootParcel(
            // @ts-expect-error
            {},
            {
                domElement: null,
            },
        );

        const mountRes = GlobalBrowserApi.mountRootParcel(parcelConfig, {
            domElement: null as unknown as HTMLElement,
        });
        expect(mountRes.mount).to.be.a('function');
        expect(mountRes.unmount).to.be.a('function');
        expect(mountRes.getStatus).to.be.a('function');
        expect(mountRes.mountPromise).to.be.a('promise');
        expect(mountRes.loadPromise).to.be.a('promise');
        expect(mountRes.bootstrapPromise).to.be.a('promise');
        expect(mountRes.unmountPromise).to.be.a('promise');

        GlobalBrowserApi.mountRootParcel(() => Promise.resolve(parcelConfig), {
            domElement: null as unknown as HTMLElement,
        });
    });

    it('getAllSharedLibNames is correctly typed and callable', async () => {
        const res = await GlobalBrowserApi.getAllSharedLibNames();
        expect(res).to.deep.eq(['libName_1', 'libName_2']);
    });

    it('loadApp is correctly typed and callable (no options arg)', async () => {
        const res = await GlobalBrowserApi.loadApp('@portal/news');
        expect(res).to.deep.eq(app);
    });
    it('unloadApp is correctly typed and callable (no options arg)', async () => {
        expect(GlobalBrowserApi.unloadApp('news_at_body')).to.be.fulfilled;
    });
    it('loadApp is correctly typed and callable (empty option arg)', async () => {
        const res = await GlobalBrowserApi.loadApp('@portal/news', {});
        expect(res).to.deep.eq(app);
    });
    it('loadApp is correctly typed and callable (injectGlobalCss arg)', async () => {
        const res = await GlobalBrowserApi.loadApp('@portal/news', { injectGlobalCss: false });
        expect(res).to.deep.eq(app);
    });
    it('loadApp is correctly typed and callable (generic)', async () => {
        interface MyLifecycles extends LifeCycles<AppLifecycleFnProps> {
            bootstrap: LifeCycleFn<object>;
        }
        const res = await GlobalBrowserApi.loadApp<MyLifecycles>('@portal/news', { injectGlobalCss: false });
        expect(res.bootstrap).to.be.a('function');
    });
    it('getApplicationConfig is correctly typed and callable (generic)', async () => {
        const res = await GlobalBrowserApi.getApplicationConfig<AppProps>('@portal/news');
        expect(res?.props?.appConfig).to.deep.eq({});
    });
    it('should return true if ILC is available', () => {
        expect(GlobalBrowserApi.isIlcEnvironment()).to.equal(true);
    });
    it('should return false if ILC is not available', () => {
        delete (window as any).ILC;
        expect(GlobalBrowserApi.isIlcEnvironment()).to.equal(false);
    });
});
