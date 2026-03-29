# Testing

All files must be tested with a coverage of over 95%. While this is a straightforward process in the core application (taqwim folder), it has proven to be a challenging task for the extension files (the ones that use VSCode API).

### Challenges with Extension Testing

Using Vite to transpile the code, and the lack of built-in coverage reporting in the official [`@vscode/test-electron`](https://www.npmjs.com/package/@vscode/test-electron) package, makes it difficult to get accurate coverage reports. Many tools were attempted (nyc, c8, istanbul, etc), but none worked reliably.

### Testing Framework Selection

Even integrating testing frameworks proved challenging. The files need to be transpiled to JavaScript before running inside an instance of the VSCode application, which means Vitest is not an option. Even when files are transpiled to JavaScript with Vite, there were compatibility issues inside VSCode.

#### Frameworks Evaluated

**Mocha** - The framework used in `@vscode/test-electron` examples. However, when transpiling code using Vite, it doesn't work without setting `build.rollupOptions.output.interop` to `esModule`. This setting allows tests to transpile and run, but prevents extension files from compiling correctly for production.

**Jest** - Evaluated but the lack of Node API support limited integration capabilities.

**Jasmine** - The final choice. It has a similar API to Jest and Vitest and transpiles correctly without requiring `build.rollupOptions.output.interop` to be set to `esModule`.

### Current Status

The project uses Jasmine for testing. However, coverage reporting for the VSCode extension remains unavailable due to the technical limitations described above. The core application (taqwim folder) maintains over 95% test coverage.
