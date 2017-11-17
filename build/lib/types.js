'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isArray = isArray;
exports.isObject = isObject;
var toString = Object.prototype.toString;

// These checks are "good enough" for purposes here.

function isArray(candidate) {
    return toString.call(candidate) === '[object Array]';
}

function isObject(candidate) {
    return toString.call(candidate) === '[object Object]';
}