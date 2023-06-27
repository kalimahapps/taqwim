/**
 * Returns the index of the last element in the array where predicate is true, and -1
 * otherwise.
 *
 * @see https://stackoverflow.com/a/53187807/529024
 * @param  {Array<T>} array     The source array to search in
 * @param  {Function} predicate find calls predicate once for each element of the array,
 *                              in descending order, until it finds one where predicate
 *                              returns true. If such an element is found, findLastIndex
 *                              immediately returns that element index. Otherwise,
 *                              findLastIndex returns -1.
 * @return {number}             The index of the element found, or -1 if not found
 */
const findLastIndex = <T>(
	array: Array<T>,
	predicate: (value: T, index: number, object: T[]) => boolean
): number => {
	let l = array.length;
	while (l--) {
		if (predicate(array[l], l, array)) {
			return l;
		}
	}
	return -1;
};

export { findLastIndex };