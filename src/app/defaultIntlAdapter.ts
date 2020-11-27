import { IntlAdapter, RoutingStrategy } from './commonTypes';

/**
 * Used when i18n capability is disabled in ILC.
 * @internal
 */
const adapter: IntlAdapter = {
    config: {
        default: { locale: 'en-US', currency: 'USD' },
        supported: { locale: ['en-US'], currency: ['USD'] },
        routingStrategy: RoutingStrategy.Prefix,
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
