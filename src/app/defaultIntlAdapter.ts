import { IntlAdapter, RoutingStrategy } from './commonTypes';

/**
 * Used when i18n capability is disabled in ILC.
 * @internal
 */
const adapter: IntlAdapter = {
    config: {
        default: { locale: 'en-US', currency: 'USD' },
        supported: { locale: ['en-US'], currency: ['USD'] },
        routingStrategy: RoutingStrategy.PrefixExceptDefault,
    },
    get() {
        return this.config.default;
    },
};

/* istanbul ignore next */
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
/* istanbul ignore if */
if (isBrowser) {
    adapter.set = () => {};
}

export default adapter;
