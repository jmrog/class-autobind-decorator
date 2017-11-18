import { expect } from 'chai';
import isObject from '../src/lib/isObject';

describe('isObject', function () {
    it('should identify only plain JS objects as objects', function () {
        expect(isObject(null)).to.be.false;
        expect(isObject(undefined)).to.be.false;
        expect(isObject([])).to.be.false;
        expect(isObject(1)).to.be.false;
        expect(isObject(true)).to.be.false;
        expect(isObject(function () {})).to.be.false;
        expect(isObject(new Map())).to.be.false;
        expect(isObject(Symbol())).to.be.false;
        expect(isObject({})).to.be.true;
    });
});
