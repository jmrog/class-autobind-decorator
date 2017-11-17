(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(["exports"], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.uniqueConcatArrays = mod.exports;
    }
})(this, function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = uniqueConcatArrays;
    // Helper methods.
    var flattenArraysReducer = function flattenArraysReducer(array, nextArray) {
        return array.concat(nextArray);
    };
    var getRemoveDupesReducer = function getRemoveDupesReducer(keyHash) {
        return function (resultArray, item) {
            if (!keyHash[item]) {
                keyHash[item] = true;
                resultArray.push(item); // mutation ok here (sort of), since a new array is expected when reduction begins
            }

            return resultArray;
        };
    };

    /**
     * Concatenates arrays, removing duplicate entries.
     * 
     * NOTE: This only works reliably for arrays consisting entirely of items that
     * produce distinct `toString()` values whenever they are altered (e.g.,
     * strings, numbers, etc.). That's good enough for the use case here, since
     * this utility is only used to uniqueConcat arrays of strings, but it won't
     * always work elsewhere.
     */
    function uniqueConcatArrays() {
        for (var _len = arguments.length, arrays = Array(_len), _key = 0; _key < _len; _key++) {
            arrays[_key] = arguments[_key];
        }

        if (arrays.length < 2) {
            return arrays.length === 1 ? arrays[0].reduce(getRemoveDupesReducer({}), []) : undefined;
        }

        var flattenedArray = arrays.reduce(flattenArraysReducer);
        return flattenedArray.reduce(getRemoveDupesReducer({}), []);
    }
});