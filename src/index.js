/**
 * Overloaded function for auto-binding the methods of a class to the class's relevant instance. If
 * the first argument is a function, as it will be when this is used as a "bare" or "unconfigured"
 * decorator -- as in `@autoBindMethods class SomeClass {}` -- it does the auto-bind decorating by
 * delegating to `autoBindMethodsDecorator`. If the first argument is *not* a function, as happens
 * when this is used as a "configured" decorator -- as in `@autoBindMethods(options) class SomeClass
 * {}` -- it returns a function that *itself* accepts a function (the class constructor) as its
 * first argument and that does the auto-bind decorating by delegating to
 * `autoBindMethodsDecorator`.
 *
 * The delegate method `autoBindMethodsDecorator` is `call`ed in order to avoid changing the context
 * from whatever it would ordinarily be in the case of a non-overloaded decorator, while still
 * allowing us to pass on any received `options`.
 *
 * @param {Object} [options] - optional options
 * @param {String[]} [options.methodsToIgnore] - names of methods to skip auto-binding
 * @param {boolean} [options.dontOptimize] - if truthy, turns off the decorator's default
 *  optimization behavior, which is to define the bound method directly on the class instance
 *  in order to prevent lookups and re-binding on every access
 * @returns {*}
 */
export default function autoBindMethods(input) {
    if (typeof input !== 'function') {
        return function (target) {
            autoBindMethodsDecorator.call(this, target, input);
        }
    }

    autoBindMethodsDecorator.call(this, input);
}

/**
 * A "legacy"-style "class" decorator function for auto-binding the methods of the "class."
 *
 * @param {Function} target - an ES2015 "class" or -- what is effectively the same thing -- a
 *  constructor function.
 * @param {Object} [options] - optional options
 * @param {string[]} [options.methodsToIgnore] - names of methods to skip auto-binding
 * @param {boolean} [options.dontOptimize] - if truthy, turns off the decorator's default
 *  optimization behavior, which is to define the bound method directly on the class instance
 *  in order to prevent lookups and re-binding on every access
 */
function autoBindMethodsDecorator(target, options = {}) {
    if (typeof target !== 'function') {
        throw new TypeError(
            'The autoBindMethods decorator must be passed a function as the first argument. ' +
            `It received an argument of type ${typeof target}.`
        );
    }

    const { prototype } = target;
    const { methodsToIgnore = [], dontOptimize = false } = options;

    let ownProps = typeof Object.getOwnPropertySymbols === 'function' ?
                   Object.getOwnPropertyNames(prototype).concat(Object.getOwnPropertySymbols(prototype)) :
                   Object.getOwnPropertyNames(prototype);

    if (methodsToIgnore.length > 0) {
        ownProps = ownProps.filter((prop) => methodsToIgnore.indexOf(prop) === -1);
    }

    ownProps.forEach((ownPropIdentifier) => {
        const propDescriptor = Object.getOwnPropertyDescriptor(prototype, ownPropIdentifier);
        const { value, configurable } = propDescriptor;

        if (typeof value !== 'function' || !configurable) {
            // We can only do our work with configurable functions, so bail early here.
            return;
        }

        Object.defineProperty(prototype, ownPropIdentifier, {
            get() {
                if (this.hasOwnProperty(ownPropIdentifier)) {
                    // Don't bind the prototype's method to the prototype, or we can't re-bind it.
                    return value;
                }

                const boundMethod = value.bind(this);

                if (!dontOptimize) {
                    const { configurable, writable } = propDescriptor;

                    Object.defineProperty(this, ownPropIdentifier, {
                        value: boundMethod,
                        configurable,
                        writable
                    });
                }

                return boundMethod;
            }
        });
    });
}
