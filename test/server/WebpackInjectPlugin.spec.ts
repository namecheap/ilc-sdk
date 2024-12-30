import { expect } from 'chai';
import path from 'path';
import { ENTRY_ORDER, WebpackInjectPlugin, registry } from '../../src/server/webpack-inject-plugin/plugin';

describe('WebpackInjectPlugin', () => {
    let mockCompiler: any;

    beforeEach(() => {
        mockCompiler = {
            options: {
                entry: './src/index.js',
                resolveLoader: {
                    extensions: ['.js'],
                },
            },
        };

        // Clear the registry
        Object.keys(registry).forEach((key) => delete registry[key]);
    });

    it('should inject loader into entry string', () => {
        const plugin = new WebpackInjectPlugin(() => '', {
            entryOrder: ENTRY_ORDER.First,
        });
        plugin.apply(mockCompiler);

        expect(mockCompiler.options.entry).to.deep.equal([
            path.resolve(__dirname, '../../src/server/webpack-inject-plugin', `loader?id=${Object.keys(registry)[0]}!`),
            './src/index.js',
        ]);
    });

    it('should inject loader into entry array', () => {
        mockCompiler.options.entry = ['./src/first.js', './src/index.js'];

        const plugin = new WebpackInjectPlugin(() => '', {
            entryOrder: ENTRY_ORDER.Last,
        });
        plugin.apply(mockCompiler);

        expect(mockCompiler.options.entry).to.deep.equal([
            './src/first.js',
            './src/index.js',
            path.resolve(__dirname, '../../src/server/webpack-inject-plugin', `loader?id=${Object.keys(registry)[0]}!`),
        ]);
    });

    it('should inject loader into entry object', () => {
        mockCompiler.options.entry = {
            main: './src/main.js',
            admin: './src/admin.js',
        };

        const plugin = new WebpackInjectPlugin(() => '', {
            entryName: 'main',
            entryOrder: ENTRY_ORDER.First,
        });
        plugin.apply(mockCompiler);

        expect(mockCompiler.options.entry).to.deep.equal({
            main: [
                path.resolve(
                    __dirname,
                    '../../src/server/webpack-inject-plugin',
                    `loader?id=${Object.keys(registry)[0]}!`,
                ),
                './src/main.js',
            ],
            admin: './src/admin.js',
        });
    });

    it('should inject loader into asynchronous entry function', async () => {
        mockCompiler.options.entry = async () => ({
            main: './src/main.js',
        });

        const plugin = new WebpackInjectPlugin(() => '', {
            entryOrder: ENTRY_ORDER.Last,
        });
        plugin.apply(mockCompiler);

        const modifiedEntry = await mockCompiler.options.entry();

        expect(modifiedEntry).to.deep.equal({
            main: [
                './src/main.js',
                path.resolve(
                    __dirname,
                    '../../src/server/webpack-inject-plugin',
                    `loader?id=${Object.keys(registry)[0]}!`,
                ),
            ],
        });
    });

    it('should add .ts extension to resolveLoader.extensions', () => {
        const plugin = new WebpackInjectPlugin(() => '');
        plugin.apply(mockCompiler);

        expect(mockCompiler.options.resolveLoader.extensions).to.include('.ts');
    });
    it('should inject loader into entry array with NotLast order', () => {
        mockCompiler.options.entry = ['./src/first.js', './src/index.js', './src/last.js'];

        const plugin = new WebpackInjectPlugin(() => '', {
            entryOrder: ENTRY_ORDER.NotLast,
        });
        plugin.apply(mockCompiler);

        expect(mockCompiler.options.entry).to.deep.equal([
            './src/first.js',
            './src/index.js',
            path.resolve(__dirname, '../../src/server/webpack-inject-plugin', `loader?id=${Object.keys(registry)[0]}!`),
            './src/last.js',
        ]);
    });

    it('should inject loader into entry object with a function filter', () => {
        mockCompiler.options.entry = {
            main: './src/main.js',
            admin: './src/admin.js',
        };

        const plugin = new WebpackInjectPlugin(() => '', {
            entryName: (entryName) => entryName === 'admin',
            entryOrder: ENTRY_ORDER.First,
        });
        plugin.apply(mockCompiler);

        expect(mockCompiler.options.entry).to.deep.equal({
            main: './src/main.js',
            admin: [
                path.resolve(
                    __dirname,
                    '../../src/server/webpack-inject-plugin',
                    `loader?id=${Object.keys(registry)[0]}!`,
                ),
                './src/admin.js',
            ],
        });
    });
    it('should handle undefined original entry by returning new entry', () => {
        mockCompiler.options.entry = undefined;

        const plugin = new WebpackInjectPlugin(() => '', {
            entryOrder: ENTRY_ORDER.First,
        });
        plugin.apply(mockCompiler);

        expect(mockCompiler.options.entry).to.equal(
            path.resolve(__dirname, '../../src/server/webpack-inject-plugin', `loader?id=${Object.keys(registry)[0]}!`),
        );
    });
});
