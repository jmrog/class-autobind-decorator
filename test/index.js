import 'babel-polyfill';
import { expect } from 'chai';
import autoBindMethods, { autoBindMethodsForReact } from '../src';

const symbolKey = Symbol('symbolKey');

/**
 * Helper method for performing tests. TODO: This is probably overkill.
 *
 * @param {Function} UnboundClass
 * @param {Function} FullyBoundClass
 * @param {Array.<string|Symbol>} [ignoredMethods]
 */
function testBindings(
    {
        UnboundClass,
        FullyBoundClass,
        PartiallyBoundClass,
        FullyBoundReactClass,
        PartiallyBoundReactClass
    },
    ignoredMethods = []
) {
    const unboundInstance = new UnboundClass();
    const boundInstance = new FullyBoundClass();
    const boundConfiguredInstance = new PartiallyBoundClass();
    const boundReactInstance = new FullyBoundReactClass();
    const boundConfiguredReactInstance = new PartiallyBoundReactClass();
    const unboundTestMethodOne = unboundInstance.testMethodOne;
    const unboundSymbolMethod = unboundInstance[symbolKey];
    const boundTestMethodOne = boundInstance.testMethodOne;
    const boundSymbolMethod = boundInstance[symbolKey];
    const boundConfiguredTestMethodOne = boundConfiguredInstance.testMethodOne;
    const boundConfiguredTestMethodTwo = boundConfiguredInstance.testMethodTwo;
    const boundConfiguredSymbolMethod = boundConfiguredInstance[symbolKey];
    const boundReactTestMethodOne = boundReactInstance.testMethodOne;
    const boundReactSymbolMethod = boundReactInstance[symbolKey];
    const boundConfiguredReactTestMethodOne = boundConfiguredReactInstance.testMethodOne;
    const boundConfiguredReactTestMethodTwo = boundConfiguredReactInstance.testMethodTwo;
    const boundConfiguredReactSymbolMethod = boundConfiguredReactInstance[symbolKey];

    expect(unboundTestMethodOne(unboundInstance)).to.be.false;
    expect(unboundSymbolMethod(unboundInstance)).to.be.false;
    expect(boundTestMethodOne(boundInstance)).to.be.true;
    expect(boundSymbolMethod(boundInstance)).to.be.true;
    expect(boundConfiguredTestMethodOne(boundConfiguredInstance)).to.equal(ignoredMethods.includes('testMethodOne') ? false : true);
    expect(boundConfiguredTestMethodTwo(boundConfiguredInstance)).to.equal(ignoredMethods.includes('testMethodTwo') ? false : true);
    expect(boundConfiguredSymbolMethod(boundConfiguredInstance)).to.equal(ignoredMethods.includes(symbolKey) ? false : true);
    expect(boundReactTestMethodOne(boundReactInstance)).to.be.true;
    expect(boundReactSymbolMethod(boundReactInstance)).to.be.true;
    expect(boundConfiguredReactTestMethodOne(boundConfiguredReactInstance)).to.equal(ignoredMethods.includes('testMethodOne') ? false : true);
    expect(boundConfiguredReactTestMethodTwo(boundConfiguredReactInstance)).to.equal(ignoredMethods.includes('testMethodTwo') ? false : true);
    expect(boundConfiguredReactSymbolMethod(boundConfiguredReactInstance)).to.equal(ignoredMethods.includes(symbolKey) ? false : true);
}

function isBound(instance, context) {
    return instance === context;
}

/**
 * Retrieves five classes for testing -- one unbound, one auto-bound, one
 * auto-bound-with-options (some methods ignored), and one auto-bound-for-React,
 * and one auto-bound-for-React-with-options (some additional methods ignored).
 * The classes are defined inline so that new ones are returned for each test
 * that uses this method.
 * 
 * TODO: This also seems to be overkill; does far more than is necessary for
 * most tests below.
 */
function getClasses(autoBindOptions) {
    class UnboundClass {
        testMethodOne(instance) {
            return isBound(instance, this);
        }

        [symbolKey](instance) {
            return isBound(instance, this);
        }
    }

    @autoBindMethods
    class FullyBoundClass {
        testMethodOne(instance) {
            return isBound(instance, this);
        }

        [symbolKey](instance) {
            return isBound(instance, this);
        }
    }

    @autoBindMethods(autoBindOptions)
    class PartiallyBoundClass {
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

    @autoBindMethodsForReact
    class FullyBoundReactClass {
        testMethodOne(instance) {
            return isBound(instance, this);
        }

        [symbolKey](instance) {
            return isBound(instance, this);
        }

        render() {}
    }

    @autoBindMethodsForReact(autoBindOptions)
    class PartiallyBoundReactClass {
        testMethodOne(instance) {
            return isBound(instance, this);
        }

        testMethodTwo(instance) {
            return isBound(instance, this);
        }

        [symbolKey](instance) {
            return isBound(instance, this);
        }

        render() {}
    }

    return {
        UnboundClass,
        FullyBoundClass,
        PartiallyBoundClass,
        FullyBoundReactClass,
        PartiallyBoundReactClass
    };
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

    it('should not redefine constructors', function () {
        const { UnboundClass } = getClasses();
        const firstInstance = new UnboundClass();
        const untouchedConstructor = UnboundClass.prototype.constructor;
        
        autoBindMethods(UnboundClass);
        const secondInstance = new UnboundClass();

        expect(firstInstance.constructor).to.equal(UnboundClass.prototype.constructor);
        expect(secondInstance.constructor).to.equal(UnboundClass.prototype.constructor);
        expect(UnboundClass.prototype.constructor).to.equal(untouchedConstructor);
    });

    // This test turns out to be important for React 16 interop.
    // See https://github.com/jmrog/class-autobind-decorator/issues/4
    it('should allow overwriting autobound properties', function () {
        const { FullyBoundClass } = getClasses();
        const instance = new FullyBoundClass();
        instance.testMethodOne(); // autobind with optimization to write property on instance

        function test() {
            instance.testMethodOne = 're-assigned';
            FullyBoundClass.prototype.constructor = 'nope';
            FullyBoundClass.prototype.testMethodOne = function () { return 'x'; };
            return true;
        }

        expect(test).not.to.throw;
        test(); // ensure this is run before the next two tests; the prior `expect` line does not do that (there's probably a better way to do this)
        expect(FullyBoundClass.prototype.testMethodOne()).to.equal('x');
        expect(instance.testMethodOne).to.equal('re-assigned');
    });

    it('should maintain property descriptor behavior as much as possible', function () {
        const { UnboundClass } = getClasses();

        function testEnumeration(testee) {
            for (let item in testee) {
                if (item === 'specialProperty') {
                    throw new Error();
                }
            }
        }

        function testWritability(testee) {
            testee.specialProperty = false;
        }

        Object.defineProperty(UnboundClass.prototype, 'specialProperty', {
            value: () => 'unwritable and unenumerable!',
            configurable: true
        });

        autoBindMethods(UnboundClass);
        const instance = new UnboundClass();

        expect(() => testEnumeration(instance)).not.to.throw;
        expect(() => testWritability(instance)).not.to.throw;
        expect(instance.specialProperty()).to.equal('unwritable and unenumerable!');
        expect(() => testEnumeration(UnboundClass.prototype)).not.to.throw;
        expect(() => testWritability(UnboundClass.prototype)).to.throw;
        expect(UnboundClass.prototype.specialProperty()).to.equal('unwritable and unenumerable!');
    });

    describe('overwriting an autobound property', function () {
        it('should behave like normal assignment (descriptor-wise, plus no magic autobinding)', function () {
            const { FullyBoundClass } = getClasses();
            const instance = new FullyBoundClass();

            FullyBoundClass.prototype.testMethodOne = function() {
                return this === FullyBoundClass.prototype;
            };

            instance.testMethodOne(); // trigger binding to instance
            instance.testMethodOne = function() {
                return this === instance;
            };

            const prototypeDescriptor = Object.getOwnPropertyDescriptor(FullyBoundClass.prototype, 'testMethodOne');
            const instanceDescriptor = Object.getOwnPropertyDescriptor(instance, 'testMethodOne');
            const prototypeMethod = FullyBoundClass.prototype.testMethodOne;
            const instanceMethod = instance.testMethodOne;
            const newInstance = new FullyBoundClass();
            newInstance.testMethodOne(); // should not magically autobind
            const newInstanceMethod = newInstance.testMethodOne;

            [prototypeDescriptor, instanceDescriptor].forEach((descriptor) => {
                ['configurable', 'enumerable', 'writable'].forEach((setting) => {
                    expect(descriptor[setting]).to.be.true;
                });
            });

            expect(prototypeMethod()).to.be.false;
            expect(instanceMethod()).to.be.false;
            expect(newInstanceMethod()).to.be.false;
        });
    });

    describe('when returned from a call that specifies no options', function () {
        it('should autobind all methods', function () {
            testBindings(getClasses());
        });
    });

    describe('when returned from a call that specifies options', function () {
        describe('when the options specify methods to ignore', function () {
            it('should bind only the unignored methods', function () {
                testBindings(getClasses(autoBindOptions), autoBindOptions.methodsToIgnore);
            });
        });

        describe('when the options specify dontOptimize', function () {
            it('should not alter the instance and should re-bind on every access', function () {
                const { UnboundClass } = getClasses();
                const customAutoBinder = autoBindMethods({ dontOptimize: true });

                customAutoBinder(UnboundClass);
                const myFirstInstance = new UnboundClass();

                const a = myFirstInstance.testMethodOne;
                const b = myFirstInstance.testMethodOne;
                expect(a).not.to.equal(b);
                expect(myFirstInstance.hasOwnProperty('testMethodOne')).to.be.false;
                expect(b(myFirstInstance)).to.be.true;
            });
        });

        describe('when the options do not specify dontOptimize', function () {
            it('should alter the instance and not re-bind on every access', function () {
                const { FullyBoundClass } = getClasses();
                const myFirstInstance = new FullyBoundClass();

                const a = myFirstInstance.testMethodOne;
                const b = myFirstInstance.testMethodOne;
                expect(a).to.equal(b);
                expect(myFirstInstance.hasOwnProperty('testMethodOne')).to.be.true;
            });
        });
    });

    describe('when passed a "class" with methods that are not configurable', function () {
        it('should skip binding those functions and not throw', function () {
            const { UnboundClass } = getClasses();

            Object.defineProperty(UnboundClass.prototype, 'nonConfigurable', {
                value: function (instance) {
                    return instance === this;
                },
                configurable: false
            });

            expect(() => autoBindMethods(UnboundClass)).not.to.throw;

            autoBindMethods(UnboundClass); // ensure this happens before next lines; prior `expect` line doesn't do this (there's probably a better way to do this)
            const myInstance = new UnboundClass();
            const { testMethodOne, nonConfigurable } = myInstance;

            expect(testMethodOne(myInstance)).to.be.true;
            expect(nonConfigurable(myInstance)).to.be.false;
        });
    });

    describe('when a method is accessed via the prototype', function () {
        it('should not bind the method to the prototype', function () {
            const { FullyBoundClass } = getClasses();
            FullyBoundClass.prototype.testMethodOne; // `get` via prototype, not instance, should not bind

            const myInstance = new FullyBoundClass();
            myInstance.__proto__.testMethodOne; // similarly, should not bind
            const { testMethodOne } = myInstance;

            expect(testMethodOne(myInstance)).to.be.true; // should be bound to the instance now, not the prototype
        });
    });

    describe('when applied to a class that has multiple instances', function () {
        it('should bind the method to each individual instance', function () {
            const { FullyBoundClass } = getClasses();
            const myFirstInstance = new FullyBoundClass();
            const mySecondInstance = new FullyBoundClass();

            let { testMethodOne } = myFirstInstance;

            expect(testMethodOne(myFirstInstance)).to.be.true;
            expect(testMethodOne(mySecondInstance)).to.be.false;
            expect(myFirstInstance.hasOwnProperty('testMethodOne')).to.be.true;
            expect(FullyBoundClass.prototype.hasOwnProperty('testMethodOne')).to.be.true;
            expect(mySecondInstance.hasOwnProperty('testMethodOne')).to.be.false;
            
            testMethodOne = mySecondInstance.testMethodOne;

            expect(testMethodOne(mySecondInstance)).to.be.true;
            expect(mySecondInstance.hasOwnProperty('testMethodOne')).to.be.true;
        });
    });
});

describe('autoBindMethodsForReact', function () {
    it('should throw if input is neither a function nor a plain object nor falsey', function () {
        expect(() => autoBindMethodsForReact()).not.to.throw;
        expect(() => autoBindMethodsForReact({})).not.to.throw;
        expect(() => autoBindMethodsForReact(function () {})).not.to.throw;
        expect(() => autoBindMethodsForReact([])).to.throw;
        expect(() => autoBindMethodsForReact(null)).to.throw;
        expect(() => autoBindMethodsForReact(false)).to.throw;
        expect(() => autoBindMethodsForReact(Symbol())).to.throw;
    });

    it('should skip binding methods in the React Component Spec to instances', function () {
        @autoBindMethodsForReact
        class TestClass {
            render() {}
        }

        const testInstance = new TestClass();
        testInstance.render();

        // the method would be on the instance if the decorator had applied
        expect('render' in testInstance).to.be.true;
        expect(testInstance.hasOwnProperty('render')).to.be.false;
    });
});
