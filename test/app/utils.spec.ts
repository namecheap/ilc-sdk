import { expect } from 'chai';
import { JSDOM } from 'jsdom';

import resolveDirectory from '../../src/app/utils/resolveDirectory';

describe('Utils', () => {
    describe('resolveDirectory', () => {
        beforeEach(() => {
            const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
            (global as any).window = dom.window;
            (global as any).document = dom.window.document;
        });

        afterEach(() => {
            delete (global as any).window;
            delete (global as any).document;
        });

        it('works with default directory level', () => {
            expect(resolveDirectory('http://localhost:8080/foo.js')).to.equal('http://localhost:8080/');
        });

        it('works with query & hash', () => {
            expect(resolveDirectory('http://localhost:8080/foo.js?tst=1#azaz')).to.equal('http://localhost:8080/');
        });

        it('works for urls with multiple directories in the path', () => {
            expect(resolveDirectory('http://localhost:8080/bar/foo.js')).to.equal('http://localhost:8080/bar/');

            expect(resolveDirectory('http://localhost:8080/bar/baz/foo.js')).to.equal('http://localhost:8080/bar/baz/');
        });

        it('can properly set handle two or more directories up', () => {
            expect(resolveDirectory('http://localhost:8080/bar/foo.js', 2)).to.equal('http://localhost:8080/');

            expect(resolveDirectory('http://localhost:8080/bar/baz/foo.js', 2)).to.equal('http://localhost:8080/bar/');

            expect(resolveDirectory('http://localhost:8080/bar/baz/foo.js', 3)).to.equal('http://localhost:8080/');
        });

        it('behaves gracefully in case rootDirectoryLevel is greater than the number of directories', () => {
            expect(resolveDirectory('http://localhost:8080/bar/foo.js', 4)).to.equal('http://localhost:8080/');
        });
    });
});
