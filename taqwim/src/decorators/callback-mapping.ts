/**
 * Add callback mapping to a class method
 *
 * @param  {any}    target     The method target
 * @param  {string} methodName The method name
 * @param  {any}    descriptor The method descriptor
 *
 * @return {any}               The new method descriptor
 */
/* eslint complexity: ["warn", 7] */
const WithCallMapping = (target: any, methodName: string, descriptor: any) => {
	const originalMethod = descriptor.value;

	// Define new function
	descriptor.value = function (...parameters: any[]) {
		const callOriginal = originalMethod.call(this, ...parameters);

		if (callOriginal === false) {
			return;
		}

		// Make sure that node is defined
		if (this.node === undefined) {
			throw new TypeError('node property is not defined');
		}

		const { kind } = this.node;

		// Make sure that callbackMap is defined and not empty
		if (this.callbacksMap === undefined) {
			throw new TypeError('callbacksMap property is not defined');
		}

		if (Object.keys(this.callbacksMap).length === 0) {
			throw new TypeError('callbacksMap property is empty');
		}

		// Find which callback to use
		const callback = Object.keys(this.callbacksMap).find((key) => {
			return this.callbacksMap[key].includes(kind);
		});

		const className = this.constructor.name;
		if (callback === undefined) {
			throw new TypeError(`callbacksMap does not have a callback for \`${kind}\` kind in ${className} class`);
		}

		const callbackFunction = this[callback];
		if (typeof callbackFunction !== 'function') {
			throw new TypeError(`${className} class does not have a \`${callback}\` method`);
		}

		callbackFunction.call(this);
	};

	return descriptor;
};

export {
	WithCallMapping
};