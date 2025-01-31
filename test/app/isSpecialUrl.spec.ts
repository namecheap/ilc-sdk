import { expect } from 'chai';
import { isSpecialUrl } from '../../app';

describe('isSpecialUrl', () => {
    it('should return true for special URLs', () => {
        const specialUrls = ['#anchor', 'tel:1234567890', 'mailto:test@example.com', 'javascript:void(0)'];
        specialUrls.forEach((url) => {
            expect(isSpecialUrl(url)).to.be.true;
        });
    });

    it('should return true for empty string', () => {
        expect(isSpecialUrl('')).to.be.true;
    });

    it('should return false for regular URLs', () => {
        const regularUrls = ['http://example.com', 'https://example.com', '/path/to/resource'];
        regularUrls.forEach((url) => {
            expect(isSpecialUrl(url)).to.be.false;
        });
    });
});
