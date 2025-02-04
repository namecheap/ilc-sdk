import { expect } from 'chai';
import * as sinon from 'sinon';
import { JSDOM } from 'jsdom';

import { IntlAdapter, IntlAdapterConfig, RoutingStrategy } from '../../src/app/types';
import { IlcIntl, cache } from '../../src/app/IlcIntl';

const baseConfig: IntlAdapterConfig = Object.freeze({
    default: { locale: 'en-US', currency: 'USD' },
    supported: { locale: ['en-US', 'es-ES', 'es-MX'], currency: ['USD', 'EUR'] },
    routingStrategy: RoutingStrategy.PrefixExceptDefault,
});
const currConfig = { locale: 'es-ES', currency: 'EUR' };
const getAdapter = (currentConfig = currConfig): IntlAdapter => ({
    get: () => currentConfig,
    config: baseConfig,
});

const getClientAdapter = (currentConfig = currConfig) => ({
    get: () => currentConfig,
    set: sinon.spy(),
    config: baseConfig,
});

describe('IlcIntl', () => {
    describe('CSR functionality', () => {
        beforeEach(() => {
            const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
            (global as any).window = dom.window;
        });

        afterEach(() => {
            delete (global as any).window;
        });

        it('sets i18n params', () => {
            const adapter = getClientAdapter();
            const intl = new IlcIntl('tst', adapter);

            const newConf = { locale: 'es-MX', currency: 'USD' };
            intl.set(newConf);
            sinon.assert.calledOnceWithExactly(adapter.set, newConf);
        });

        it('should handle options ', () => {
            const adapter = getClientAdapter();
            const intl = new IlcIntl('tst', adapter, { manifestPath: 'value' });
            expect(intl.getLocalisationManifestPath()).equal('value');
        });

        it('fires callback on language change & unsubscribes correctly', () => {
            const adapter = getClientAdapter();
            const intl = new IlcIntl('tst', adapter);

            const prepare = sinon.spy();
            const execute = sinon.spy();

            const unsubscribe = intl.onChange(prepare, execute);

            const detail = {
                addHandler: sinon.spy(),
            };
            window.dispatchEvent(new window.CustomEvent('ilc:intl-update', { detail }));

            sinon.assert.calledOnceWithExactly(detail.addHandler, {
                actorId: 'tst',
                prepare,
                execute,
            });
            detail.addHandler.resetHistory();

            unsubscribe();
            window.dispatchEvent(new window.CustomEvent('ilc:intl-update', { detail }));
            sinon.assert.notCalled(detail.addHandler);
        });

        it('remove event listener on unmount', () => {
            const adapter = getClientAdapter();
            const intl = new IlcIntl('tst', adapter);
            const spy = sinon.spy(window, 'removeEventListener');
            const prepare = sinon.spy();
            const execute = sinon.spy();

            intl.onChange(prepare, execute);
            intl.unmount();
            sinon.assert.calledOnce(spy);
        });
    });

    describe('class instance', () => {
        it('returns current i18n config from adapter', () => {
            const intl = new IlcIntl('tst', getAdapter());

            expect(intl.get()).eql(currConfig);
        });

        it('use default adapter if not provided', () => {
            const intl = new IlcIntl('tst');

            expect(intl.get()).eql({
                currency: 'USD',
                locale: 'en-US',
            });
        });

        it('return undefined manifest path if not provided', () => {
            const intl = new IlcIntl('tst');

            expect(intl.getLocalisationManifestPath()).eql(undefined);
        });

        it('return undefined manifest path if not provided', () => {
            const intl = new IlcIntl('tst');

            expect(intl.getLocalisationManifestPath()).eql(undefined);
        });

        it('returns default i18n config from adapter', () => {
            const intl = new IlcIntl('tst', getAdapter());

            expect(intl.getDefault()).eql(baseConfig.default);
        });

        it('returns supported i18n config values from adapter', () => {
            const intl = new IlcIntl('tst', getAdapter());

            expect(intl.getSupported()).eql(baseConfig.supported);
        });

        it('localizes URL with current locale', () => {
            const intl = new IlcIntl('tst', getAdapter());

            expect(intl.localizeUrl('/tst')).to.equal('/es/tst', 'current locale');
        });

        it('parses URL', () => {
            const intl = new IlcIntl('tst', getAdapter());

            expect(intl.parseUrl('/es/tst')).to.eql({
                cleanUrl: '/tst',
                locale: 'es-ES',
            });
        });

        it('throws an error/returns mock when CSR methods is called on server side', () => {
            const intl = new IlcIntl('tst', getAdapter());

            expect(() => intl.set({ locale: 'en-US' })).throws(Error);
            expect(
                intl.onChange(
                    (e) => {},
                    (e, z) => {},
                ),
            ).to.be.an.instanceOf(Function);
            expect(() => intl.unmount()).throws(Error);
        });
    });

    describe('localizeUrl', () => {
        it('throws an error when unsupported locale passed', () => {
            expect(() => IlcIntl.localizeUrl(baseConfig, '/tst', { locale: 'br-BR' })).throws(Error);
        });

        it('uses default locale when none is passed', () => {
            expect(IlcIntl.localizeUrl(baseConfig, '/tst')).to.equal('/tst');
            cache.clear();
            const config = { ...baseConfig, routingStrategy: RoutingStrategy.Prefix };
            expect(IlcIntl.localizeUrl(config, '/tst')).to.equal(`/en/tst`);
        });

        it('uses passed locale', () => {
            expect(IlcIntl.localizeUrl(baseConfig, '/tst', { locale: 'es-ES' })).to.equal('/es/tst');
            expect(IlcIntl.localizeUrl(baseConfig, '/tst', { locale: 'es-MX' })).to.equal('/es-MX/tst');
        });

        it('handles absolute URI cases', () => {
            expect(IlcIntl.localizeUrl(baseConfig, 'http://tst.com')).to.eq('http://tst.com/');
            expect(IlcIntl.localizeUrl(baseConfig, 'http://tst.com/')).to.eq('http://tst.com/');

            expect(IlcIntl.localizeUrl(baseConfig, 'http://tst.com', { locale: 'es-ES' })).to.eq('http://tst.com/es/');
            expect(IlcIntl.localizeUrl(baseConfig, 'http://tst.com/', { locale: 'es-ES' })).to.eq('http://tst.com/es/');
        });
        it('handles relative URI cases', () => {
            expect(IlcIntl.localizeUrl(baseConfig, 'path/1')).to.eq('path/1');
            expect(IlcIntl.localizeUrl(baseConfig, 'path/1/')).to.eq('path/1/');

            expect(IlcIntl.localizeUrl(baseConfig, 'path/1', { locale: 'es-ES' })).to.eq('/es/path/1');
            expect(IlcIntl.localizeUrl(baseConfig, 'path/1/', { locale: 'es-ES' })).to.eq('/es/path/1/');
        });

        it('handles multiple slashes in the URL correctly', () => {
            expect(IlcIntl.localizeUrl(baseConfig, 'http://tst.com/es///google.com', { locale: 'es-ES' })).to.eq(
                'http://tst.com/es/google.com',
            );
        });

        it('handles special cases', () => {
            expect(IlcIntl.localizeUrl(baseConfig, '/')).to.equal('/');
            expect(IlcIntl.localizeUrl(baseConfig, '/', { locale: 'es-ES' })).to.equal('/es/');

            expect(IlcIntl.localizeUrl(baseConfig, '')).to.equal('');
            expect(IlcIntl.localizeUrl(baseConfig, '', { locale: 'es-ES' })).to.equal('');

            expect(IlcIntl.localizeUrl(baseConfig, '#')).to.equal('#');
            expect(IlcIntl.localizeUrl(baseConfig, '#', { locale: 'es-ES' })).to.equal('#');

            expect(IlcIntl.localizeUrl(baseConfig, '#foo')).to.equal('#foo');
            expect(IlcIntl.localizeUrl(baseConfig, '#foo', { locale: 'es-ES' })).to.equal('#foo');

            expect(IlcIntl.localizeUrl(baseConfig, 'tel:+1234567890')).to.equal('tel:+1234567890');
            expect(IlcIntl.localizeUrl(baseConfig, 'tel:+1234567890', { locale: 'es-ES' })).to.equal('tel:+1234567890');

            expect(IlcIntl.localizeUrl(baseConfig, 'mailto:foo@bar.baz')).to.equal('mailto:foo@bar.baz');
            expect(IlcIntl.localizeUrl(baseConfig, 'mailto:foo@bar.baz', { locale: 'es-ES' })).to.equal(
                'mailto:foo@bar.baz',
            );

            expect(IlcIntl.localizeUrl(baseConfig, 'javascript:void(0)')).to.equal('javascript:void(0)');
            expect(IlcIntl.localizeUrl(baseConfig, 'javascript:void(0)', { locale: 'es-ES' })).to.equal(
                'javascript:void(0)',
            );
        });

        it('fallbacks to original value on invalid urls', () => {
            expect(IlcIntl.localizeUrl(baseConfig, 'http://:')).to.equal('http://:');
        });
    });

    describe('parseUrl', () => {
        it('returns default locale when none is present in the route', () => {
            expect(IlcIntl.parseUrl(baseConfig, '/tst')).to.eql({
                cleanUrl: '/tst',
                locale: baseConfig.default.locale,
            });
        });

        it('returns locale with default culture when no culture present in the route', () => {
            expect(IlcIntl.parseUrl(baseConfig, '/es/tst')).to.eql({
                cleanUrl: '/tst',
                locale: 'es-ES',
            });
        });

        it('returns locale with normalized route when multiple slashes are present', () => {
            expect(IlcIntl.parseUrl(baseConfig, '/es///tst.com')).to.eql({
                cleanUrl: '/tst.com',
                locale: 'es-ES',
            });
        });

        it('returns locale with default culture when no culture present in the route', () => {
            expect(IlcIntl.parseUrl(baseConfig, '/es-MX/tst')).to.eql({
                cleanUrl: '/tst',
                locale: 'es-MX',
            });
        });

        it('handles absolute URI cases', () => {
            expect(IlcIntl.parseUrl(baseConfig, 'http://tst.com')).to.eql({
                cleanUrl: 'http://tst.com/',
                locale: baseConfig.default.locale,
            });
            expect(IlcIntl.parseUrl(baseConfig, 'http://tst.com/es/')).to.eql({
                cleanUrl: 'http://tst.com/',
                locale: 'es-ES',
            });
        });

        it('handles relative url cases', () => {
            expect(IlcIntl.parseUrl(baseConfig, 'path/1')).to.eql({
                cleanUrl: 'path/1',
                locale: baseConfig.default.locale,
            });
            expect(IlcIntl.parseUrl(baseConfig, 'path/1/')).to.eql({
                cleanUrl: 'path/1/',
                locale: baseConfig.default.locale,
            });
            expect(IlcIntl.parseUrl(baseConfig, 'es/path/1')).to.eql({
                cleanUrl: '/path/1',
                locale: 'es-ES',
            });
            expect(IlcIntl.parseUrl(baseConfig, 'es/path/1/')).to.eql({
                cleanUrl: '/path/1/',
                locale: 'es-ES',
            });
        });

        it('handles multiple slashes in the URL correctly', () => {
            expect(IlcIntl.parseUrl(baseConfig, 'http://tst.com/es///google.com')).to.eql({
                cleanUrl: 'http://tst.com/google.com',
                locale: 'es-ES',
            });
        });

        it('handles URL with multiple slashes and a port', () => {
            expect(IlcIntl.parseUrl(baseConfig, 'http://tst.com:3000/es///google.com')).to.eql({
                cleanUrl: 'http://tst.com:3000/google.com',
                locale: 'es-ES',
            });
        });

        it('handles corner cases', () => {
            expect(IlcIntl.parseUrl(baseConfig, '/')).to.eql({
                cleanUrl: '/',
                locale: baseConfig.default.locale,
            });

            expect(IlcIntl.parseUrl(baseConfig, '')).to.eql({
                cleanUrl: '',
                locale: baseConfig.default.locale,
            });

            expect(IlcIntl.parseUrl(baseConfig, '#')).to.eql({
                cleanUrl: '#',
                locale: baseConfig.default.locale,
            });

            expect(IlcIntl.parseUrl(baseConfig, '#foo')).to.eql({
                cleanUrl: '#foo',
                locale: baseConfig.default.locale,
            });

            expect(IlcIntl.parseUrl(baseConfig, 'tel:+1234567890')).to.eql({
                cleanUrl: 'tel:+1234567890',
                locale: baseConfig.default.locale,
            });

            expect(IlcIntl.parseUrl(baseConfig, 'mailto:foo@bar.baz')).to.eql({
                cleanUrl: 'mailto:foo@bar.baz',
                locale: baseConfig.default.locale,
            });

            expect(IlcIntl.parseUrl(baseConfig, 'javascript:void(0)')).to.eql({
                cleanUrl: 'javascript:void(0)',
                locale: baseConfig.default.locale,
            });
        });
    });

    describe('getCanonicalLocale', () => {
        it('returns null when undefined locale passed', () => {
            const supportedLocales = ['en-US', 'ua-UA'];

            expect(IlcIntl.getCanonicalLocale(undefined, supportedLocales)).to.be.null;
        });

        it('returns null when unsupported locale passed', () => {
            const supportedLocales = ['en-US', 'ua-UA'];

            expect(IlcIntl.getCanonicalLocale('br-BR', supportedLocales)).to.be.null;
            expect(IlcIntl.getCanonicalLocale('zazazaz', supportedLocales)).to.be.null;
            expect(IlcIntl.getCanonicalLocale('za-sddf-fdf', supportedLocales)).to.be.null;
        });

        it('adds culture when necessary using the one that goes first in the list', () => {
            const supportedLocales = ['en-US', 'es-ES', 'es-MX'];

            expect(IlcIntl.getCanonicalLocale('es', supportedLocales)).to.equal('es-ES');
            expect(IlcIntl.getCanonicalLocale('ES', supportedLocales)).to.equal('es-ES');
            expect(IlcIntl.getCanonicalLocale('Es', supportedLocales)).to.equal('es-ES');
            expect(IlcIntl.getCanonicalLocale('eS', supportedLocales)).to.equal('es-ES');

            expect(IlcIntl.getCanonicalLocale('en', supportedLocales)).to.equal('en-US');
            expect(IlcIntl.getCanonicalLocale('EN', supportedLocales)).to.equal('en-US');
            expect(IlcIntl.getCanonicalLocale('En', supportedLocales)).to.equal('en-US');
            expect(IlcIntl.getCanonicalLocale('eN', supportedLocales)).to.equal('en-US');
        });

        it('formats locale', () => {
            const supportedLocales = ['en-US', 'es-ES', 'es-MX'];

            expect(IlcIntl.getCanonicalLocale('es-es', supportedLocales)).to.equal('es-ES');
            expect(IlcIntl.getCanonicalLocale('ES-ES', supportedLocales)).to.equal('es-ES');
            expect(IlcIntl.getCanonicalLocale('Es-eS', supportedLocales)).to.equal('es-ES');
            expect(IlcIntl.getCanonicalLocale('eS-Es', supportedLocales)).to.equal('es-ES');
        });
    });
});
