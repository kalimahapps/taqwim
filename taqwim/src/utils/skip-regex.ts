/**
 * Skip regex special characters
 *
 * @param  {string} string String to skip regex special characters
 * @return {string}        String with skipped regex special characters
 */
const skipRegex = (string: string) => {
	return string.replaceAll(/[$()*+./?[\\\]^{|}]/gu, '\\$&');
};

export {
	skipRegex
};