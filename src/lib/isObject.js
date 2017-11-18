const { toString } = Object.prototype;

// This check is "good enough" for purposes here.
export default function isObject(candidate) {
    return toString.call(candidate) === '[object Object]';
}
