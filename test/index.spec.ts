import IlcSdk from '../src/index';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { Request as MockReq, Response as MockRes } from 'mock-http';
import merge from 'lodash.merge';

import fakeCons from './utils/console';

const defReq = Object.freeze({
    url: '/tst',
    headers: {host: 'example.com'}
});

describe('IlcSdk', () => {
    let ilcSdk: IlcSdk, stubCons: sinon.SinonStubbedInstance<Console>;

    beforeEach(() => {
        stubCons = sinon.stub(fakeCons);
        ilcSdk = new IlcSdk({logger: fakeCons});
    });

    afterEach(() => {
        (sinon as any).restoreObject(fakeCons);
    });

    describe('processRequest', () => {
        it('should not fail on regular request', () => {
            const req = new MockReq(merge({}, defReq));
            const res = ilcSdk.processRequest(req);

            expect(res.getCurrentPathProps()).to.eql({});
            expect(res.getCurrentBasePath()).to.eq('/');
            expect(res.getCurrentReqUrl()).to.eq('/');
            sinon.assert.calledOnceWithExactly(stubCons.warn, 'Missing "routerProps" for "http://example.com/tst" request. Fallback to / & /');
        });

        describe('should correctly determine base path', () => {
            it('with trailing slash', () => {
                const routerProps = JSON.stringify({
                    basePath: '/base/path/',
                    reqUrl: '/base/path/a/b/c?a=1&b=a'
                });
                const req = new MockReq(merge({}, defReq, {
                    url: `/tst?routerProps=${Buffer.from(routerProps, 'utf8').toString('base64')}`
                }));
                const res = ilcSdk.processRequest(req);

                expect(res.getCurrentBasePath()).to.eq('/base/path/');
                expect(res.getCurrentReqUrl()).to.eq('/a/b/c?a=1&b=a');
                sinon.assert.notCalled(stubCons.warn);
            });

            it('without trailing slash', () => {
                const routerProps = JSON.stringify({
                    basePath: '/base/path',
                    reqUrl: '/base/path/a/b/c?a=1&b=a'
                });
                const req = new MockReq(merge({}, defReq, {
                    url: `/tst?routerProps=${Buffer.from(routerProps, 'utf8').toString('base64')}`
                }));
                const res = ilcSdk.processRequest(req);

                expect(res.getCurrentBasePath()).to.eq('/base/path');
                expect(res.getCurrentReqUrl()).to.eq('/a/b/c?a=1&b=a');
                sinon.assert.notCalled(stubCons.warn);
            });
        });

        describe('should parse app props', () => {
            it('should parse props', () => {
                const appProps = JSON.stringify({
                    a: 'b',
                    c: {d: 'e'}
                });
                const req = new MockReq(merge({}, defReq, {
                    url: `/tst?appProps=${Buffer.from(appProps, 'utf8').toString('base64')}`
                }));
                const res = ilcSdk.processRequest(req);

                expect(res.getCurrentPathProps()).to.eql(JSON.parse(appProps));
            });

            it('should fallback in case of malformed props', () => {
                const req = new MockReq(merge({}, defReq, {
                    url: `/tst?appProps=bad_props`
                }));
                const res = ilcSdk.processRequest(req);

                expect(res.getCurrentPathProps()).to.eql({});
            });
        });
    });


    describe('processResponse', () => {
        it('should not fail on regular request', () => {
            const req = new MockReq(merge({}, defReq));
            const res = new MockRes();

            const pRes = ilcSdk.processRequest(req);
            ilcSdk.processResponse(pRes, res);
        });

        it('should set page title', () => {
            const req = new MockReq(merge({}, defReq));
            const res = new MockRes();

            const pRes = ilcSdk.processRequest(req);
            ilcSdk.processResponse(pRes, res, {pageTitle: 'Test title'});
            expect(res.getHeader('x-head-title')).to.eq(Buffer.from('<title>Test title</title>', 'utf8').toString('base64'));
        });

        it('should set page meta tags', () => {
            const req = new MockReq(merge({}, defReq));
            const res = new MockRes();

            const pRes = ilcSdk.processRequest(req);
            ilcSdk.processResponse(pRes, res, {pageMetaTags: '<meta charset="utf-8">'});
            expect(res.getHeader('x-head-meta')).to.eq(Buffer.from('<meta charset="utf-8">', 'utf8').toString('base64'));
        });
    })

});