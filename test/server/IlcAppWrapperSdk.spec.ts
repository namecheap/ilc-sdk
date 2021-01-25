import { IlcAppWrapperSdk } from '../../src/server';
import { expect } from 'chai';
import { Request as MockReq, Response as MockRes } from 'mock-http';
import merge from 'lodash.merge';

import fakeCons from '../utils/console';

const defReq = Object.freeze({
    url: '/tst',
    headers: { host: 'example.com', 'x-request-host': 'example.com', 'x-request-uri': '/tst' },
});

describe('IlcAppWrapperSdk', () => {
    let ilcSdk: IlcAppWrapperSdk;

    beforeEach(() => {
        ilcSdk = new IlcAppWrapperSdk({ logger: fakeCons });
    });

    describe('forwardRequest', () => {
        it('should send basic response correctly', () => {
            const req = new MockReq(merge({}, defReq));
            const res = new MockRes();

            const pRes = ilcSdk.processRequest(req);
            ilcSdk.forwardRequest(pRes, res);

            expect(res.statusCode).to.eql(210);
            expect(res.writableEnded).to.be.true;
        });

        it('should send x-props-override header if necessary', () => {
            const req = new MockReq(merge({}, defReq));
            const res = new MockRes();

            const testProps = { test: 1 };

            const pRes = ilcSdk.processRequest(req);
            ilcSdk.forwardRequest(pRes, res, { propsOverride: testProps });
            expect(res.getHeader('x-props-override')).to.eq(
                Buffer.from(JSON.stringify(testProps), 'utf8').toString('base64'),
            );
        });

        it('should cause an error if headers have already been sent', () => {
            const req = new MockReq(merge({}, defReq));
            const res = new MockRes();
            res.end();

            const pRes = ilcSdk.processRequest(req);
            expect(() => ilcSdk.forwardRequest(pRes, res)).to.throw();
        });
    });
});
