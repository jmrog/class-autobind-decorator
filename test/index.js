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

        describe('when the options specify dontOptimize', function () {
            it('should not alter the instance and should re-bind on every access', function () {
                const [MyFirstClass] = getClasses();
                const customAutoBinder = autoBindMethods({ dontOptimize: true });

                customAutoBinder(MyFirstClass);
                const myFirstInstance = new MyFirstClass();

                const a = myFirstInstance.testMethodOne;
                const b = myFirstInstance.testMethodOne;
                expect(a).not.to.equal(b);
                expect(myFirstInstance.hasOwnProperty('testMethodOne')).to.equal(false);
            });
        });

        describe('when the options do not specify dontOptimize', function () {
            it('should alter the instance and not re-bind on every access', function () {
                const [, MySecondClass] = getClasses();
                const myFirstInstance = new MySecondClass();

                const a = myFirstInstance.testMethodOne;
                const b = myFirstInstance.testMethodOne;
                expect(a).to.equal(b);
                expect(myFirstInstance.hasOwnProperty('testMethodOne')).to.equal(true);
            })
        })
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

    describe('when a method is accessed via the prototype', function () {
        it('should not bind the method to the prototype', function () {
            const [ , MySecondClass] = getClasses();
            MySecondClass.prototype.testMethodOne; // `get` via prototype, not instance, should not bind

            const myInstance = new MySecondClass();
            myInstance.__proto__.testMethodOne; // similarly, should not bind
            const { testMethodOne } = myInstance;

            expect(testMethodOne(myInstance)).to.equal(true); // should be bound to the instance now, not the prototype
        });
    });

    describe('when applied to a class that has multiple instances', function () {
        it('should bind the method to each individual instance', function () {
            const [ , MySecondClass] = getClasses();
            const myFirstInstance = new MySecondClass();
            const mySecondInstance = new MySecondClass();

            let { testMethodOne } = myFirstInstance;

            expect(testMethodOne(myFirstInstance)).to.equal(true);
            expect(testMethodOne(mySecondInstance)).to.equal(false);
            
            testMethodOne = mySecondInstance.testMethodOne;

            expect(testMethodOne(mySecondInstance)).to.equal(true);
        });
    });
});
