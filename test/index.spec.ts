import IlcSdk from '../src/index';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { Request as MockReq, Response as MockRes } from 'mock-http';

describe('IlcSdk', () => {
    it('should not fail on regular request', () => {
        const cons = sinon.stub(console);
        const ilcSdk = new IlcSdk({logger: cons});
        const req = new MockReq({
            url: '/tst',
            headers: {host: 'example.com'}
        });
        const res = ilcSdk.processRequest(req);

        expect(res.getCurrentPathProps()).to.eql({});
        expect(res.getCurrentBasePath()).to.eq('/');
        expect(res.getCurrentReqUrl()).to.eq('/');
        sinon.assert.calledOnceWithExactly(cons.warn, 'Missing "routerProps" for "http://example.com/tst" request. Fallback to / & /');
    });
});