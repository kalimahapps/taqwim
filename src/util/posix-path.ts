const posixPath = function (path: string) {
	return path.replaceAll('\\', '/');
};

export { posixPath };
