import { expect } from 'chai';
import { getShortenedLocale } from '../../src/app/utils/getShortenedLocale';

describe('getShortenedLocale', () => {
    it('throws an error when unsupported locale passed', () => {
        const supportedLocales = ['en-US', 'ua-UA'];

        expect(() => getShortenedLocale('br-BR', supportedLocales)).throws(Error);
    });

    it('shortens locale which is specified first in the list', () => {
        const supportedLocales = ['en-US', 'es-ES', 'es-MX'];

        expect(getShortenedLocale('es-ES', supportedLocales)).to.equal('es');
        expect(getShortenedLocale('en-US', supportedLocales)).to.equal('en');
    });

    it('does not shortens locale which is specified 2nd+ in the list', () => {
        const supportedLocales = ['en-US', 'es-ES', 'es-MX'];

        expect(getShortenedLocale('es-MX', supportedLocales)).to.equal('es-MX');
    });
});
