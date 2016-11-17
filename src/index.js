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
 * @param {String[]} [options.methodsToIgnore] - names of methods to skip auto-binding
 */
function autoBindMethodsDecorator(target, options = {}) {
    if (typeof target !== 'function') {
        throw new TypeError(
            'The autoBindMethods decorator must be passed a function as the first argument. ' +
            `It received an argument of type ${typeof target}.`
        );
    }

    const { prototype } = target;
    const { methodsToIgnore = [] } = options;
    let ownProps = typeof Object.getOwnPropertySymbols === 'function' ?
                   Object.getOwnPropertyNames(prototype).concat(Object.getOwnPropertySymbols(prototype)) :
                   Object.getOwnPropertyNames(prototype);

    if (methodsToIgnore.length > 0) {
        ownProps = ownProps.filter((prop) => methodsToIgnore.indexOf(prop) === -1);
    }

    ownProps.forEach((ownPropIdentifier) => {
        const propDescriptor = Object.getOwnPropertyDescriptor(prototype, ownPropIdentifier);
        const { value } = propDescriptor;

        if (typeof value !== 'function' || !propDescriptor.configurable) {
            // We can only do our work with configurable functions, so bail early here.
            return;
        }

        let boundMethod;

        Object.defineProperty(prototype, ownPropIdentifier, {
            get() {
                if (!boundMethod) {
                    if (!(this instanceof target)) {
                        // We don't want to bind to something that isn't an instance of the constructor in the rare
                        // case where the property is read by some means other than an instance *before* it has been
                        // bound (e.g., if something checks whether the method exists via the prototype, as in
                        // `someConstructor.prototype.someProp`), so we just return the unbound method in that case.
                        return value;
                    }

                    boundMethod = value.bind(this);
                }

                return boundMethod;
            }
        });
    });
}
