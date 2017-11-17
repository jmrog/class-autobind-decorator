'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = isArray;
var toString = Object.prototype.toString;
function isArray(candidate) {
    return toString.call(candidate) === '[object Array]';
}