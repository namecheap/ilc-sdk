import { IntlAdapter } from './commonTypes';

const adapter: IntlAdapter = {
    config: {
        default: { locale: 'en-US', currency: 'USD' },
        supported: { locale: ['en-US'], currency: ['USD'] },
    },
    get() {
        return this.config.default;
    },
};

const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
if (isBrowser) {
    adapter.set = () => {};
}

export default adapter;
