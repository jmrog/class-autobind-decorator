'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.default = autoBindMethods;
/**
 * Exports a decorator factory function. The function accepts options for configuring the behavior
 * of the returned decorator. The returned decorator is a "legacy"-style "class" decorator function
 * for auto-binding the methods of the "class" (i.e., the methods on a constructor function's
 * `prototype` property) to the instances of the "class."
 *
 * @param {Object} [options] - optional options
 * @param {String[]} [options.methodsToIgnore] - names of methods to skip auto-binding
 * @returns {Function} autoBindMethodsDecorator
 */
function autoBindMethods() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];


    /**
     * A "legacy"-style "class" decorator function for auto-binding the methods of the "class."
     * References the outer function's `options` for proper behavior.
     *
     * @param {Function} target - an ES2015 "class" or -- what is effectively the same thing -- a
     *  constructor function.
     */
    return function autoBindMethodsDecorator(target) {
        if (typeof target !== 'function') {
            throw new TypeError('The autoBindMethods decorator must be passed a function as the first argument. ' + ('It received an argument of type ' + (typeof target === 'undefined' ? 'undefined' : _typeof(target)) + '.'));
        }

        var prototype = target.prototype;
        var _options$methodsToIgn = options.methodsToIgnore;
        var methodsToIgnore = _options$methodsToIgn === undefined ? [] : _options$methodsToIgn;

        var ownProps = typeof Object.getOwnPropertySymbols === 'function' ? Object.getOwnPropertyNames(prototype).concat(Object.getOwnPropertySymbols(prototype)) : Object.getOwnPropertyNames(prototype);

        if (methodsToIgnore.length > 0) {
            ownProps = ownProps.filter(function (prop) {
                return methodsToIgnore.indexOf(prop) === -1;
            });
        }

        ownProps.forEach(function (ownPropIdentifier) {
            var propDescriptor = Object.getOwnPropertyDescriptor(prototype, ownPropIdentifier);
            var value = propDescriptor.value;


            if (typeof value !== 'function' || !propDescriptor.configurable) {
                // We can only do our work with configurable functions, so bail early here.
                return;
            }

            var boundMethod = void 0;

            Object.defineProperty(prototype, ownPropIdentifier, {
                get: function get() {
                    if (!boundMethod) {
                        boundMethod = value.bind(this);
                    }

                    return boundMethod;
                }
            });
        });
    };
}