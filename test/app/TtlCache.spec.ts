import { expect } from 'chai';
import { TtlCache } from '../../src/app/utils/TtlCache';
import sinon from 'sinon';

describe('TtlCache', () => {
    let clock: sinon.SinonFakeTimers;
    let setTimeoutBackup: typeof setTimeout;

    beforeEach(() => {
        setTimeoutBackup = global.setTimeout;
        clock = sinon.useFakeTimers();
    });

    afterEach(() => {
        clock.restore();
        global.setTimeout = setTimeoutBackup;
    });

    it('should set and get a value', () => {
        const cache = new TtlCache<string, number>({ ttl: 1000 });
        cache.set('key1', 123);
        expect(cache.get('key1')).to.equal(123);
    });

    it('should wrap a function and cache its result', () => {
        const cache = new TtlCache<string, number>({ ttl: 1000 });
        const fn = (x: number) => x * 2;
        const wrappedFn = cache.wrap(fn, (x) => `key-${x}`);

        expect(wrappedFn(2)).to.equal(4);
        expect(cache.get('key-2')).to.equal(4);
    });

    it('should return cached value for wrapped function', () => {
        const cache = new TtlCache<string, number>({ ttl: 1000 });
        const fn = sinon.spy((x: number) => x * 2);
        const wrappedFn = cache.wrap(fn, (x) => `key-${x}`);

        wrappedFn(2);
        wrappedFn(2);

        expect(fn.calledOnce).to.be.true;
        expect(cache.get('key-2')).to.equal(4);
    });

    it('should clean up expired values', () => {
        const cache = new TtlCache<string, number>({ ttl: 1000, cleanupInterval: 500 });
        cache.set('key1', 123);
        expect(cache.get('key1')).to.equal(123);
        clock.tick(1001);
        clock.tick(500); // Trigger cleanup
        expect(cache.get('key1')).to.be.undefined;
    });

    it('should clear all values', () => {
        const cache = new TtlCache<string, number>({ ttl: 1000 });
        cache.set('key1', 123);
        cache.set('key2', 456);
        cache.clear();
        expect(cache.get('key1')).to.be.undefined;
        expect(cache.get('key2')).to.be.undefined;
    });

    it('should destroy the cache', () => {
        const cache = new TtlCache<string, number>({ ttl: 1000, cleanupInterval: 500 });
        cache.set('key1', 123);
        cache.destroy();
        expect(cache.get('key1')).to.be.undefined;
        // Ensure cleanup interval is cleared
        clock.tick(1001);
        clock.tick(500); // Trigger cleanup
        expect(cache.get('key1')).to.be.undefined;
    });

    it('should not schedule cleanup if setTimeout is not available', () => {
        const cache = new TtlCache<string, number>({ ttl: 1000, cleanupInterval: 500 });
        global.setTimeout = undefined as any;
        cache.set('key1', 123);
        expect(cache.get('key1')).to.equal(123);
        clock.tick(1001);
        expect(cache.get('key1')).to.equal(123);
    });
});
