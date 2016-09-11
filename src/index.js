/**
 * Exports a decorator factory function. The function accepts options for configuring the behavior
 * of the returned decorator. The returned decorator is a "legacy"-style "class" decorator function
 * for auto-binding the methods of the "class" (i.e., the methods on a constructor function's
 * `prototype` property) to the instances of the "class."
 *
 * @param {Object} [options] - optional options
 * @param {boolean} [options.enumerableOnly] - if truthy, the returned decorator auto-binds only the
 *  own enumerable methods of the "class" (i.e., the own enumerable methods of the relevant
 *  prototype); otherwise, it auto-binds all "own" methods, enumerable or not
 * @param {String[]} [options.methodsToIgnore] - names of methods to skip auto-binding
 * @returns {Function} autoBindMethodsDecorator
 */
export default function autoBindMethods(options = {}) {

    /**
     * A "legacy"-style "class" decorator function for auto-binding the methods of the "class."
     * References the outer function's `options` for proper behavior.
     *
     * @param {Function} target - an ES2015 "class" or -- what is effectively the same thing -- a
     *  constructor function.
     */
    return function autoBindMethodsDecorator(target) {
        if (typeof target !== 'function') {
            throw new TypeError(
                'The autoBindMethods decorator must be passed a function as the first argument. ' +
                `It received an argument of type ${typeof target}.`
            );
        }

        const { prototype } = target;
        const { methodsToIgnore = [], enumerableOnly } = options;
        let ownProps = enumerableOnly ?
            Object.keys(prototype) :
            Object.getOwnPropertyNames(prototype);

        if (methodsToIgnore.length > 0) {
            ownProps = ownProps.filter((prop) => methodsToIgnore.indexOf(prop) === -1);
        }

        ownProps.forEach((ownPropName) => {
            const propDescriptor = Object.getOwnPropertyDescriptor(prototype, ownPropName);
            const { value } = propDescriptor;

            if (typeof value !== 'function' || !propDescriptor.configurable) {
                // We can only do our work with configurable functions, so bail early here.
                return;
            }

            let boundMethod;

            Object.defineProperty(prototype, ownPropName, {
                get() {
                    if (!boundMethod) {
                        boundMethod = value.bind(this);
                    }

                    return boundMethod;
                }
            });
        });
    }

}
