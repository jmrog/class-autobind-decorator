import ReactComponentSpecMethods from './lib/ReactComponentSpecMethods';
import isObject from './lib/isObject';
import uniqueConcatArrays from './lib/uniqueConcatArrays';

/**
 * Overloaded function for auto-binding the methods of a class to the class's relevant instance. If
 * the first argument is a function, as it will be when this is used as a "bare" or "unconfigured"
 * decorator -- as in `@autoBindMethods class SomeClass {}` -- it does the auto-bind decorating by
 * delegating to `autoBindMethodsDecorator`. If the first argument is *not* a function, as happens
 * when this is used as a "configured" decorator -- as in `@autoBindMethods(options) class SomeClass
 * {}` -- it returns a function that *itself* accepts a function (the class constructor) as its
 * first argument, and that does the auto-bind decorating by delegating to
 * `autoBindMethodsDecorator`.
 *
 * The delegate method `autoBindMethodsDecorator` is `call`ed in order to avoid changing the context
 * from whatever it would ordinarily be in the case of a non-overloaded decorator, while still
 * allowing us to pass on any received `options`.
 *
 * @param {Object|Function|undefined} [input] - optional options or the function/class to decorate
 * @param {String[]} [input.methodsToIgnore] - names of methods to skip auto-binding; applicable
 *  only if `input` is not a function
 * @param {boolean} [options.dontOptimize] - if truthy, turns off the decorator's default
 *  optimization behavior, which is to define the bound method directly on the class instance
 *  when first accessed, in order to prevent re-binding on every access and traversing the
 *  prototype chain; applicable only if `input` is not a function
 * @returns {Function|undefined}
 */
export default function autoBindMethods(input) {
    if (typeof input !== 'function') {
        return function (target) {
            autoBindMethodsDecorator.call(this, target, input);
        }
    }

    autoBindMethodsDecorator.call(this, input);
}

export { autoBindMethods };

/**
 * Convenience decorator that operates the same as above, but that automatically skips all
 * methods in the React Component Spec, since they do not need auto-binding on React/Preact
 * components. Useful to those using this decorator with React, as there is no need to list
 * all of the React Component Spec methods as `methodsToIgnore`.
 *
 * @param {Object|Function|undefined} [input] - optional options or the function/class to decorate
 * @param {String[]} [input.methodsToIgnore] - names of methods to skip auto-binding; applicable
 *  only if `input` is not a function
 * @param {boolean} [options.dontOptimize] - if truthy, turns off the decorator's default
 *  optimization behavior, which is to define the bound method directly on the class instance
 *  when first accessed, in order to prevent re-binding on every access and traversing the
 *  prototype chain; applicable only if `input` is not a function
 * @returns {Function|undefined}
 */
export function autoBindMethodsForReact(input) {
    if (typeof input === 'undefined') {
        return autoBindMethods({ methodsToIgnore: ReactComponentSpecMethods });
    }

    if (typeof input !== 'function') {
        if (!isObject(input)) {
            throw new TypeError(
                `autoBindMethodsForReact was passed an input of type ${typeof input}. The input ` +
                'argument must be either a function, a plain JS object, or undefined.'
            );
        }

        return autoBindMethods({
            ...input,
            methodsToIgnore: uniqueConcatArrays(input.methodsToIgnore || [], ReactComponentSpecMethods)
        });
    }

    return autoBindMethods({ methodsToIgnore: ReactComponentSpecMethods })(input);
};

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
        if (ownPropIdentifier === 'constructor') {
            // This decorator should not muck around with constructors, for fear of introducing
            // unexpected side effects.
            return;
        }

        const propDescriptor = Object.getOwnPropertyDescriptor(prototype, ownPropIdentifier);
        const { value, configurable, enumerable } = propDescriptor;

        if (typeof value !== 'function' || !configurable) {
            // We can only do our work with configurable functions, so bail early here.
            return;
        }

        Object.defineProperty(prototype, ownPropIdentifier, {
            // Keep the same enumerability/configurability settings.
            enumerable,
            configurable,
            get() {
                if (this.hasOwnProperty(ownPropIdentifier)) {
                    // Don't bind the prototype's method to the prototype, or we can't re-bind it to instances.
                    return value;
                }

                const boundMethod = value.bind(this);

                if (!dontOptimize) {
                    // `defineProperty` must be used here rather than a standard assignment because
                    // assignments will first check for getters/setters up the prototype chain and
                    // thus reject the assignment (since the property on the prototype has a getter
                    // but no setter (see: http://www.2ality.com/2012/08/property-definition-assignment.html))
                    Object.defineProperty(this, ownPropIdentifier, {
                        enumerable,
                        configurable,
                        value: boundMethod,
                        writable: propDescriptor.writable !== false ? true : false
                    });
                }

                return boundMethod;
            },
            set(newValue) {
                if (propDescriptor.writable === false) {
                    // If the original property wasn't writable, don't change that.
                    return;
                }

                // Re-assigning a property on the prototype *after* the property has been bound by
                // the decorator should simply overwrite that property entirely; it is weird (IMO)
                // for it to magically be auto-bound to instances when assigned.
                Object.defineProperty(prototype, ownPropIdentifier, {
                    value: newValue,
                    configurable: true,
                    enumerable: true,
                    writable: true
                });
            }
        });
    });
}
