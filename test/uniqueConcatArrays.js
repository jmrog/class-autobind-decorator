import { expect } from 'chai';
import uniqueConcatArrays from '../src/lib/uniqueConcatArrays';

describe('uniqueConcatArrays', function () {
    it('should concat arrays of primitives without duplicates', function () {
        expect(uniqueConcatArrays([1, 2, 3], [2, 3, 4])).to.deep.equal([1, 2, 3, 4]);
        expect(uniqueConcatArrays(['lol', 'wut'], ['wut'], ['haha'])).to.deep.equal(['lol', 'wut', 'haha']);
        expect(uniqueConcatArrays([true, false, true], [true])).to.deep.equal([true, false]);
    });

    it('should return a deduped copy if passed only one argument', function () {
        const testDupesArray = [1, 2, 3, 2, 3];
        const testNoDupesArray = [1, 2, 3];
        expect(uniqueConcatArrays(testDupesArray)).to.deep.equal(testNoDupesArray);
        expect(uniqueConcatArrays(testNoDupesArray)).to.not.equal(testNoDupesArray);
    });

    it('should return undefined if given no arguments', function () {
        expect(uniqueConcatArrays()).to.be.undefined;
    });
});
