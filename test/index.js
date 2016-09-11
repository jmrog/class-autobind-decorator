import 'babel-polyfill';
import { expect } from 'chai';
import autoBindMethods from '../build';

const symbolKey = Symbol('symbolKey');

/**
 * Helper method for performing tests.
 *
 * @param {Function} MyFirstClass
 * @param {Function} MySecondClass
 * @param {Array.<string|Symbol>} [ignoredMethods]
 */
function testBindings(MyFirstClass, MySecondClass, ignoredMethods = []) {
    const unboundInstance = new MyFirstClass();
    const boundInstance = new MySecondClass();
    const unboundTestMethodOne = unboundInstance.testMethodOne;
    const unboundTestMethodTwo = unboundInstance.testMethodTwo;
    const unboundSymbolMethod = unboundInstance[symbolKey];
    const boundTestMethodOne = boundInstance.testMethodOne;
    const boundTestMethodTwo = boundInstance.testMethodTwo;
    const boundSymbolMethod = boundInstance[symbolKey];

    expect(unboundTestMethodOne(unboundInstance)).to.equal(false);
    expect(unboundTestMethodTwo(unboundInstance)).to.equal(false);
    expect(unboundSymbolMethod(unboundInstance)).to.equal(false);
    expect(boundTestMethodOne(boundInstance)).to.equal(ignoredMethods.includes('testMethodOne') ? false : true);
    expect(boundTestMethodTwo(boundInstance)).to.equal(ignoredMethods.includes('testMethodTwo') ? false : true);
    expect(boundSymbolMethod(boundInstance)).to.equal(ignoredMethods.includes(symbolKey) ? false : true);
}

function isBound(instance, context) {
    return instance === context;
}

function getClasses(autoBindOptions) {
    class MyFirstClass {
        testMethodOne(instance) {
            return isBound(instance, this);
        }

        testMethodTwo(instance) {
            return isBound(instance, this);
        }

        [symbolKey](instance) {
            return isBound(instance, this);
        }
    }

    @autoBindMethods(autoBindOptions)
    class MySecondClass {
        testMethodOne(instance) {
            return isBound(instance, this);
        }

        testMethodTwo(instance) {
            return isBound(instance, this);
        }

        [symbolKey](instance) {
            return isBound(instance, this);
        }
    }

    return { MyFirstClass, MySecondClass };
}

// Sanity check.
describe('autoBindMethods', function () {
    it('should return a function that takes one argument', function () {
        const returnVal = autoBindMethods();

        expect(returnVal).to.be.a('function');
        expect(returnVal.length).to.equal(1);
    });
});

describe('autoBindMethodsDecorator', function () {
    describe('when returned from a call that specifies no options', function () {
        it('should autobind all methods', function () {
            const { MyFirstClass, MySecondClass } = getClasses();
            testBindings(MyFirstClass, MySecondClass);
        });
    });

    describe('when returned from a call that specifies options', function () {
        describe('when the options specify methods to ignore', function () {
            it('should bind only the unignored methods', function () {
                const autoBindOptions = {
                    methodsToIgnore: ['testMethodOne', symbolKey]
                };
                const { MyFirstClass, MySecondClass } = getClasses(autoBindOptions);
                testBindings(MyFirstClass, MySecondClass, autoBindOptions.methodsToIgnore);
            });
        });
    });
});
