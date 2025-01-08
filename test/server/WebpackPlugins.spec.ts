import { expect } from 'chai';
import 'chai-snapshot-matcher';
import { readFileSync } from 'fs';
import path from 'path';
import { Stats, webpack } from 'webpack';
import { WebpackPluginsFactory } from '../../src/server';

function matchBundle(this: Mocha.Context, done: (err?: Error) => void, err: null | Error, stats?: Stats) {
    if (err) {
        return done(err);
    }
    if (stats?.hasErrors()) {
        return done(
            new Error(
                stats
                    .toJson()
                    .errors?.map((x) => x.message)
                    .join(','),
            ),
        );
    }
    if (stats?.hasWarnings()) {
        return done(
            new Error(
                stats
                    .toJson()
                    .warnings?.map((x) => x.message)
                    .join(','),
            ),
        );
    }
    const bundle = readFileSync(path.resolve(__dirname, '../fixtures/dist/app.js'), 'utf-8');
    expect(bundle).matchSnapshot(this);
    done();
}

describe('WebpackPluginsFactory', () => {
    it('should generate client bundle (default)', function (done) {
        const { client } = WebpackPluginsFactory();
        webpack(
            {
                mode: 'production',
                entry: path.resolve(__dirname, '../fixtures/app.js'),
                output: {
                    path: path.resolve(__dirname, '../fixtures/dist'),
                    filename: 'app.js',
                    libraryTarget: 'system',
                },
                optimization: {
                    minimize: false,
                },
                plugins: client,
            },
            (err, stats) => {
                matchBundle.call(this, done, err, stats);
            },
        );
    });
    it('should generate client bundle (no public path)', function (done) {
        const { client } = WebpackPluginsFactory({
            publicPathDetection: {
                disable: true,
            },
        });
        webpack(
            {
                mode: 'production',
                entry: path.resolve(__dirname, '../fixtures/app.js'),
                output: {
                    path: path.resolve(__dirname, '../fixtures/dist'),
                    filename: 'app.js',
                    libraryTarget: 'system',
                },
                optimization: {
                    minimize: false,
                },
                plugins: client,
            },
            (err, stats) => {
                matchBundle.call(this, done, err, stats);
            },
        );
    });
    it('should generate client bundle (rootDirectoryLevel)', function (done) {
        const { client } = WebpackPluginsFactory({
            publicPathDetection: {
                rootDirectoryLevel: 2,
            },
        });
        webpack(
            {
                mode: 'production',
                entry: path.resolve(__dirname, '../fixtures/app.js'),
                output: {
                    path: path.resolve(__dirname, '../fixtures/dist'),
                    filename: 'app.js',
                    libraryTarget: 'system',
                },
                optimization: {
                    minimize: false,
                },
                plugins: client,
            },
            (err, stats) => {
                matchBundle.call(this, done, err, stats);
            },
        );
    });
    it('should generate server bundle (default)', function (done) {
        const { server } = WebpackPluginsFactory();
        webpack(
            {
                mode: 'production',
                entry: path.resolve(__dirname, '../fixtures/app.js'),
                target: 'node',
                output: {
                    path: path.resolve(__dirname, '../fixtures/dist'),
                    filename: 'app.js',
                    libraryTarget: 'commonjs2',
                },
                optimization: {
                    minimize: false,
                },
                plugins: server,
            },
            (err, stats) => {
                matchBundle.call(this, done, err, stats);
            },
        );
    });
    it('should generate server bundle (no public path)', function (done) {
        const { server } = WebpackPluginsFactory({
            publicPathDetection: {
                disable: true,
            },
        });
        webpack(
            {
                mode: 'production',
                entry: path.resolve(__dirname, '../fixtures/app.js'),
                target: 'node',
                output: {
                    path: path.resolve(__dirname, '../fixtures/dist'),
                    filename: 'app.js',
                    libraryTarget: 'commonjs2',
                },
                optimization: {
                    minimize: false,
                },
                plugins: server,
            },
            (err, stats) => {
                matchBundle.call(this, done, err, stats);
            },
        );
    });
    it('should generate server bundle (rootDirectoryLevel)', function (done) {
        const { server } = WebpackPluginsFactory({
            publicPathDetection: {
                rootDirectoryLevel: 2,
            },
        });
        webpack(
            {
                mode: 'production',
                entry: path.resolve(__dirname, '../fixtures/app.js'),
                target: 'node',
                output: {
                    path: path.resolve(__dirname, '../fixtures/dist'),
                    filename: 'app.js',
                    libraryTarget: 'commonjs2',
                },
                optimization: {
                    minimize: false,
                },
                plugins: server,
            },
            (err, stats) => {
                matchBundle.call(this, done, err, stats);
            },
        );
    });

    it('should generate server bundle (ssrPublicPath)', function (done) {
        const { server } = WebpackPluginsFactory({
            publicPathDetection: {
                ssrPublicPath: 'ssr-path',
            },
        });
        webpack(
            {
                mode: 'production',
                entry: path.resolve(__dirname, '../fixtures/app.js'),
                target: 'node',
                output: {
                    path: path.resolve(__dirname, '../fixtures/dist'),
                    filename: 'app.js',
                    libraryTarget: 'commonjs2',
                },
                optimization: {
                    minimize: false,
                },
                plugins: server,
            },
            (err, stats) => {
                matchBundle.call(this, done, err, stats);
            },
        );
    });
});
