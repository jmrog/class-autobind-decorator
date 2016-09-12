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
function testBindings(MyFirstClass, MySecondClass, MyThirdClass, ignoredMethods = []) {
    const unboundInstance = new MyFirstClass();
    const boundInstance = new MySecondClass();
    const boundConfiguredInstance = new MyThirdClass();
    const unboundTestMethodOne = unboundInstance.testMethodOne;
    const unboundSymbolMethod = unboundInstance[symbolKey];
    const boundTestMethodOne = boundInstance.testMethodOne;
    const boundSymbolMethod = boundInstance[symbolKey];
    const boundConfiguredTestMethodOne = boundConfiguredInstance.testMethodOne;
    const boundConfiguredTestMethodTwo = boundConfiguredInstance.testMethodTwo;
    const boundConfiguredSymbolMethod = boundConfiguredInstance[symbolKey];

    expect(unboundTestMethodOne(unboundInstance)).to.equal(false);
    expect(unboundSymbolMethod(unboundInstance)).to.equal(false);
    expect(boundTestMethodOne(boundInstance)).to.equal(true);
    expect(boundSymbolMethod(boundInstance)).to.equal(true);
    expect(boundConfiguredTestMethodOne(boundConfiguredInstance)).to.equal(ignoredMethods.includes('testMethodOne') ? false : true);
    expect(boundConfiguredTestMethodTwo(boundConfiguredInstance)).to.equal(ignoredMethods.includes('testMethodTwo') ? false : true);
    expect(boundConfiguredSymbolMethod(boundConfiguredInstance)).to.equal(ignoredMethods.includes(symbolKey) ? false : true);
}

function isBound(instance, context) {
    return instance === context;
}

function getClasses(autoBindOptions) {
    class MyFirstClass {
        testMethodOne(instance) {
            return isBound(instance, this);
        }

        [symbolKey](instance) {
            return isBound(instance, this);
        }
    }

    @autoBindMethods
    class MySecondClass {
        testMethodOne(instance) {
            return isBound(instance, this);
        }

        [symbolKey](instance) {
            return isBound(instance, this);
        }
    }

    @autoBindMethods(autoBindOptions)
    class MyThirdClass {
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

    return [MyFirstClass, MySecondClass, MyThirdClass];
}

// Sanity check.
describe('autoBindMethods', function () {
    it('should return a function that takes one argument', function () {
        const returnVal = autoBindMethods();

        expect(returnVal).to.be.a('function');
        expect(returnVal.length).to.equal(1);
    });
});

// Main tests.
describe('autoBindMethodsDecorator', function () {
    const autoBindOptions = {
        methodsToIgnore: ['testMethodOne', symbolKey]
    };

    describe('when returned from a call that specifies no options', function () {
        it('should autobind all methods', function () {
            testBindings(...getClasses());
        });
    });

    describe('when returned from a call that specifies options', function () {
        describe('when the options specify methods to ignore', function () {
            it('should bind only the unignored methods', function () {
                testBindings(...getClasses(autoBindOptions), autoBindOptions.methodsToIgnore);
            });
        });
    });

    describe('when passed a "class" with methods that are not configurable', function () {
        it('should skip binding those functions and not throw', function () {
            const [MyFirstClass] = getClasses();

            Object.defineProperty(MyFirstClass.prototype, 'nonConfigurable', {
                value: function (instance) {
                    return instance === this;
                },
                configurable: false
            });

            expect(autoBindMethods(MyFirstClass)).not.to.throw;

            const myInstance = new MyFirstClass();
            const { testMethodOne, nonConfigurable } = myInstance;

            expect(testMethodOne(myInstance)).to.equal(true);
            expect(nonConfigurable(myInstance)).to.equal(false);
        });
    });
});
