'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.default = autoBindMethods;
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
function autoBindMethods(input) {
    if (typeof input !== 'function') {
        return function (target) {
            autoBindMethodsDecorator.call(this, target, input);
        };
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
function autoBindMethodsDecorator(target) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

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
}