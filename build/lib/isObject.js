(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.isObject = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = isObject;
    var toString = Object.prototype.toString;


    // This check is "good enough" for purposes here.
    function isObject(candidate) {
        return toString.call(candidate) === '[object Object]';
    }
});