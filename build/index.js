(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './lib/ReactComponentSpecMethods', './lib/isObject', './lib/uniqueConcatArrays'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./lib/ReactComponentSpecMethods'), require('./lib/isObject'), require('./lib/uniqueConcatArrays'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.ReactComponentSpecMethods, global.isObject, global.uniqueConcatArrays);
        global.index = mod.exports;
    }
})(this, function (exports, _ReactComponentSpecMethods, _isObject, _uniqueConcatArrays) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.autoBindMethods = undefined;
    exports.default = autoBindMethods;
    exports.autoBindMethodsForReact = autoBindMethodsForReact;

    var _ReactComponentSpecMethods2 = _interopRequireDefault(_ReactComponentSpecMethods);

    var _isObject2 = _interopRequireDefault(_isObject);

    var _uniqueConcatArrays2 = _interopRequireDefault(_uniqueConcatArrays);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var _extends = Object.assign || function (target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i];

            for (var key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    target[key] = source[key];
                }
            }
        }

        return target;
    };

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

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
    function autoBindMethods(input) {
        if (typeof input !== 'function') {
            return function (target) {
                autoBindMethodsDecorator.call(this, target, input);
            };
        }

        autoBindMethodsDecorator.call(this, input);
    }

    exports.autoBindMethods = autoBindMethods;


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
    function autoBindMethodsForReact(input) {
        if (typeof input === 'undefined') {
            return autoBindMethods({ methodsToIgnore: _ReactComponentSpecMethods2.default });
        }

        if (typeof input !== 'function') {
            if (!(0, _isObject2.default)(input)) {
                throw new TypeError('autoBindMethodsForReact was passed an input of type ' + (typeof input === 'undefined' ? 'undefined' : _typeof(input)) + '. The input ' + 'argument must be either a function, a plain JS object, or undefined.');
            }

            return autoBindMethods(_extends({}, input, {
                methodsToIgnore: (0, _uniqueConcatArrays2.default)(input.methodsToIgnore || [], _ReactComponentSpecMethods2.default)
            }));
        }

        return autoBindMethods({ methodsToIgnore: _ReactComponentSpecMethods2.default })(input);
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
            if (ownPropIdentifier === 'constructor') {
                // This decorator should not muck around with constructors, for fear of introducing
                // unexpected side effects.
                return;
            }

            var propDescriptor = Object.getOwnPropertyDescriptor(prototype, ownPropIdentifier);
            var value = propDescriptor.value,
                configurable = propDescriptor.configurable,
                enumerable = propDescriptor.enumerable;


            if (typeof value !== 'function' || !configurable) {
                // We can only do our work with configurable functions, so bail early here.
                return;
            }

            Object.defineProperty(prototype, ownPropIdentifier, {
                // Keep the same enumerability/configurability settings.
                enumerable: enumerable,
                configurable: configurable,
                get: function get() {
                    if (this.hasOwnProperty(ownPropIdentifier)) {
                        // Don't bind the prototype's method to the prototype, or we can't re-bind it to instances.
                        return value;
                    }

                    var boundMethod = value.bind(this);

                    if (!dontOptimize) {
                        // `defineProperty` must be used here rather than a standard assignment because
                        // assignments will first check for getters/setters up the prototype chain and
                        // thus reject the assignment (since the property on the prototype has a getter
                        // but no setter (see: http://www.2ality.com/2012/08/property-definition-assignment.html))
                        Object.defineProperty(this, ownPropIdentifier, {
                            enumerable: enumerable,
                            configurable: configurable,
                            value: boundMethod,
                            writable: propDescriptor.writable !== false ? true : false
                        });
                    }

                    return boundMethod;
                },
                set: function set(newValue) {
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
});