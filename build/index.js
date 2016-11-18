'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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
 * @param {boolean} [options.dontOptimize] - if truthy, turns off the decorator's default
 *  optimization behavior, which is to define the bound method directly on the class instance
 *  in order to prevent lookups and re-binding on every access
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
 * @param {string[]} [options.methodsToIgnore] - names of methods to skip auto-binding
 * @param {boolean} [options.dontOptimize] - if truthy, turns off the decorator's default
 *  optimization behavior, which is to define the bound method directly on the class instance
 *  in order to prevent lookups and re-binding on every access
 */
function autoBindMethodsDecorator(target) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (typeof target !== 'function') {
        throw new TypeError('The autoBindMethods decorator must be passed a function as the first argument. ' + ('It received an argument of type ' + (typeof target === 'undefined' ? 'undefined' : _typeof(target)) + '.'));
    }

    var prototype = target.prototype;
    var _options$methodsToIgn = options.methodsToIgnore,
        methodsToIgnore = _options$methodsToIgn === undefined ? [] : _options$methodsToIgn,
        _options$dontOptimize = options.dontOptimize,
        dontOptimize = _options$dontOptimize === undefined ? false : _options$dontOptimize;


    var ownProps = typeof Object.getOwnPropertySymbols === 'function' ? Object.getOwnPropertyNames(prototype).concat(Object.getOwnPropertySymbols(prototype)) : Object.getOwnPropertyNames(prototype);

    if (methodsToIgnore.length > 0) {
        ownProps = ownProps.filter(function (prop) {
            return methodsToIgnore.indexOf(prop) === -1;
        });
    }

    ownProps.forEach(function (ownPropIdentifier) {
        var propDescriptor = Object.getOwnPropertyDescriptor(prototype, ownPropIdentifier);
        var value = propDescriptor.value,
            configurable = propDescriptor.configurable;


        if (typeof value !== 'function' || !configurable) {
            // We can only do our work with configurable functions, so bail early here.
            return;
        }

        Object.defineProperty(prototype, ownPropIdentifier, {
            get: function get() {
                if (this.hasOwnProperty(ownPropIdentifier)) {
                    // Don't bind the prototype's method to the prototype, or we can't re-bind it.
                    return value;
                }

                var boundMethod = value.bind(this);

                if (!dontOptimize) {
                    var _configurable = propDescriptor.configurable,
                        writable = propDescriptor.writable;


                    Object.defineProperty(this, ownPropIdentifier, {
                        value: boundMethod,
                        configurable: _configurable,
                        writable: writable
                    });
                }

                return boundMethod;
            }
        });
    });
}