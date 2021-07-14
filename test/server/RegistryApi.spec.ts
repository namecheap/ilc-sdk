import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import nock from 'nock';
import urljoin from 'url-join';
import * as sinon from 'sinon';
import { RegistryApi } from '../../src/server/RegistryApi';
import fakeCons from '../utils/console';
import wait from '../utils/wait';

chai.use(chaiAsPromised);
const expect = chai.expect;

const registryOrigin = 'http://registry';
const allApps = [
    {
        name: '@portal/name1',
        discoveryMetadata: {
            foo: 'foo1',
        },
    },
    {
        name: '@portal/name2',
        discoveryMetadata: {
            foo: 'foo1',
            bar: 'bar1',
        },
    },
    {
        name: '@portal/name3',
        discoveryMetadata: {
            foo: 'foo1',
            bar: 'bar1',
            baz: 'baz1',
        },
    },
];

describe('RegistryApi', () => {
    let registryApi: RegistryApi;
    let scope: nock.Scope;
    let stubCons: sinon.SinonStubbedInstance<Console>;

    beforeEach(() => {
        stubCons = sinon.stub(fakeCons);

        scope = nock(registryOrigin).get('/api/v1/public/app_discovery').once().reply(200, allApps);

        registryApi = new RegistryApi(registryOrigin, { logger: fakeCons });
    });

    afterEach(() => {
        (sinon as any).restoreObject(fakeCons);

        nock.cleanAll();
        nock.enableNetConnect();
    });

    describe('constructor options', () => {
        it('should correctly set default options', () => {
            registryApi = new RegistryApi(registryOrigin);

            expect((registryApi as any).log).equal(console);
        });
    });

    describe('discoverApps', () => {
        it('should show typing errors', async () => {
            // @ts-expect-error
            await registryApi.discoverApps({ q: {} });
            // @ts-expect-error
            await registryApi.discoverApps({ q: [] });
        });

        it("should return all apps if query isn't provided", async () => {
            const apps = await registryApi.discoverApps();

            expect(apps).to.eql(allApps);
        });

        it('should return filtered apps by query', async () => {
            const apps = await registryApi.discoverApps({
                foo: 'foo1',
                bar: 'bar1',
            });

            expect(apps).to.eql([allApps[1], allApps[2]]);
        });

        it('should use memoization', async () => {
            registryApi = new RegistryApi(registryOrigin, { maxAgeMillisecondsOfGetApps: 400, logger: fakeCons });

            let apps = await registryApi.discoverApps({
                foo: 'foo1',
                bar: 'bar1',
            });
            expect(apps).to.eql([allApps[1], allApps[2]]);

            // remove one item from response
            nock.cleanAll();
            nock.enableNetConnect();
            scope = nock(registryOrigin)
                .get('/api/v1/public/app_discovery')
                .once()
                .reply(200, [allApps[0], allApps[1]]);

            // still receives old response
            apps = await registryApi.discoverApps({
                foo: 'foo1',
                bar: 'bar1',
            });
            expect(apps).to.eql([allApps[1], allApps[2]]);

            await wait(500);

            // only after expiration we see new response
            apps = await registryApi.discoverApps({
                foo: 'foo1',
                bar: 'bar1',
            });
            expect(apps).to.eql([allApps[1]]);
        });

        it('should return previously fetched list of apps if fetching returned error', async () => {
            registryApi = new RegistryApi(registryOrigin, { maxAgeMillisecondsOfGetApps: 400, logger: fakeCons });

            let apps = await registryApi.discoverApps({
                foo: 'foo1',
                bar: 'bar1',
            });
            expect(apps).to.eql([allApps[1], allApps[2]]);

            await wait(500);

            // response with error
            nock.cleanAll();
            nock.enableNetConnect();
            scope = nock(registryOrigin).get('/api/v1/public/app_discovery').once().replyWithError('Foo error');

            // still see previously loaded apps and warning
            apps = await registryApi.discoverApps({
                foo: 'foo1',
                bar: 'bar1',
            });
            expect(apps).to.eql([allApps[1], allApps[2]]);
            sinon.assert.callCount(stubCons.warn, 1);
            sinon.assert.calledWith(
                stubCons.warn,
                sinon.match({
                    error: sinon.match.instanceOf(Error).and(sinon.match.has('message', 'Foo error')),
                    message:
                    `ILC registry (${urljoin(
                        registryOrigin,
                        '/api/v1/public/app_discovery',
                    )}) isn't available, so returned previously retrieved apps.`,
                }),
            );
        });

        it("should throw error if first fetching apps returned with error, since we don't have memoized data yet", () => {
            // response with error
            nock.cleanAll();
            nock.enableNetConnect();
            scope = nock(registryOrigin).get('/api/v1/public/app_discovery').once().replyWithError('Foo error');

            const promise = registryApi.discoverApps({
                foo: 'foo1',
                bar: 'bar1',
            });

            chai.assert.isRejected(promise, Error, 'Foo error');
        });
    });
});
