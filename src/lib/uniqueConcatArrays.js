// Helper methods.
const flattenArraysReducer = (array, nextArray) => array.concat(nextArray);
const getRemoveDupesReducer = (keyHash) => (resultArray, item) => {
    if (!keyHash[item]) {
        keyHash[item] = true;
        resultArray.push(item); // mutation ok here (sort of), since a new array is expected when reduction begins
    }

    return resultArray;
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
export default function uniqueConcatArrays(...arrays) {
    if (arrays.length < 2) {
        return arrays.length === 1 ?
            arrays[0].reduce(getRemoveDupesReducer({}), []) :
            undefined;
    }

    const flattenedArray = arrays.reduce(flattenArraysReducer);
    return flattenedArray.reduce(getRemoveDupesReducer({}), []);
}
