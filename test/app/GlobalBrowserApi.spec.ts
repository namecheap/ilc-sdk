import { expect } from 'chai';
import { GlobalBrowserApi } from '../../src/app/GlobalBrowserApi';

describe('GlobalBrowserApi', () => {
    before(() => {
        (global as any).window = {
            ILC: {
                navigate: () => 'navigate',
                importParcelFromApp: () => Promise.resolve('importParcelFromApp'),
                mountRootParcel: () => 'mountRootParcel',
            },
        };
    });

    it('navigate is correctly typed and callable', () => {
        const res = GlobalBrowserApi.navigate('aaa');
        expect(res).to.eq('navigate');
    });

    it('importParcelFromApp is correctly typed and callable', async () => {
        // @ts-expect-error
        await GlobalBrowserApi.importParcelFromApp('aaa');

        const res = await GlobalBrowserApi.importParcelFromApp('aaa', 'bbb');
        expect(res).to.eq('importParcelFromApp');
    });

    it('mountRootParcel is correctly typed and callable', async () => {
        const parcelConfig = await GlobalBrowserApi.importParcelFromApp('aaa', 'bbbb');

        // @ts-expect-error
        GlobalBrowserApi.mountRootParcel(parcelConfig, {});

        GlobalBrowserApi.mountRootParcel(
            // @ts-expect-error
            {},
            {
                domElement: (null as unknown) as HTMLElement,
            },
        );

        const mountRes = GlobalBrowserApi.mountRootParcel(parcelConfig, {
            domElement: (null as unknown) as HTMLElement,
        });
        expect(mountRes).to.eq('mountRootParcel');

        GlobalBrowserApi.mountRootParcel(() => Promise.resolve(parcelConfig), {
            domElement: (null as unknown) as HTMLElement,
        });
    });
});
