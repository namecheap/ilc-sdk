import { expect } from 'chai';
import sinon from 'sinon';
import { injectLoader } from '../../src/server/webpack-inject-plugin/loader';
import { registry } from '../../src/server/webpack-inject-plugin/plugin';

// Mock the LoaderContext type
const mockLoaderContext = {
    getOptions: sinon.stub(),
    async: sinon.stub(),
};

describe('injectLoader', () => {
    let clock: sinon.SinonFakeTimers;
    beforeEach(() => {
        // Reset the registry and stubs before each test
        Object.keys(registry).forEach((key) => delete registry[key]);
        mockLoaderContext.getOptions.reset();
        mockLoaderContext.async.reset();
        clock = sinon.useFakeTimers();
    });
    afterEach(() => {
        clock.restore();
    });

    it('should use the default function if no registry entry is found', () => {
        const source = 'test source';
        mockLoaderContext.getOptions.returns({ id: 'unknownId' });

        const result = injectLoader.call(mockLoaderContext as any, source);

        expect(result).to.equal('');
    });

    it('should call the registered function if registry entry is found', () => {
        const source = 'test source';
        const id = 'testId';
        const mockFunc = sinon.stub().returns('processed source');

        registry[id] = mockFunc;
        mockLoaderContext.getOptions.returns({ id });

        const result = injectLoader.call(mockLoaderContext as any, source);

        expect(mockFunc.calledOnceWithExactly(source)).to.be.true;
        expect(result).to.equal('processed source');
    });

    it('should handle asynchronous registry functions', async () => {
        const source = 'async source';
        const id = 'asyncId';
        const mockFunc = sinon.stub().resolves('processed async source');

        registry[id] = mockFunc;
        mockLoaderContext.getOptions.returns({ id });
        const asyncCallback = sinon.stub();
        mockLoaderContext.async.returns(asyncCallback);

        injectLoader.call(mockLoaderContext as any, source);

        await Promise.resolve(); // Wait for the promise to resolve

        expect(mockFunc.calledOnceWithExactly(source)).to.be.true;
        expect(asyncCallback.calledOnceWithExactly(null, 'processed async source')).to.be.true;
    });

    it('should handle asynchronous errors gracefully', async () => {
        const source = 'error source';
        const id = 'errorId';
        const mockFunc = sinon.stub().rejects(new Error('Async error'));

        registry[id] = mockFunc;
        mockLoaderContext.getOptions.returns({ id });
        const asyncCallback = sinon.stub();
        mockLoaderContext.async.returns(asyncCallback);

        injectLoader.call(mockLoaderContext as any, source);
        await clock.runAllAsync();
        expect(mockFunc.calledOnceWithExactly(source)).to.be.true;
        expect(asyncCallback.calledOnce).to.be.true;
        expect(asyncCallback.args[0][0]).to.be.an('error');
        expect(asyncCallback.args[0][0].message).to.equal('Async error');
    });

    it('should return undefined for asynchronous processing', () => {
        const source = 'async source';
        const id = 'asyncId';
        const mockFunc = sinon.stub().resolves('processed async source');

        registry[id] = mockFunc;
        mockLoaderContext.getOptions.returns({ id });
        mockLoaderContext.async.returns(() => {});

        const result = injectLoader.call(mockLoaderContext as any, source);

        expect(result).to.be.undefined;
    });
});
