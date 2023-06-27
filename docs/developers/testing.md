# Testing
All files must be tested with a coverage of over 95%. While this is a straightforward process in core application (taqwim folder), it has proven to be an impossible task for the extension files (the ones that use VSCode API). Using vite to transpile the code, and the lack of builtin coverage report in the official [`@vscode/test-electron`](https://www.npmjs.com/package/@vscode/test-electron) package, makes it near impossible to get a coverage report. Many tools were tried (nyc, c8, istanbul, etc), but none of them worked.

Even testing frameworks are hard to integrate. The files need to be transpiled to Javascript before they are run inside an instant of VSCode application. This means that vitest is not an option. Even when files are transpiled to Javascript with vite, there were problems inside VSCode. 

The other option is Mocha, which is the one used in `@vscode/test-electron` examples and initial setup. However, when transpiling the code using `vite` it does not work without setting `build.rollupOptions.output.interop` to `esModule`. This will transpile the tests and run them but the extension files will not compile correctly for production.

Jest was also on the list of options, but the lack of node API limited the ability of integrating it into the code.

The last viable option is `jasmine`, which is the one used in this project. It has a similar API to jest and vitest. Moreover, it transpiles correctly without setting `build.rollupOptions.output.interop` to `esModule`. 

With all these options, however, there is still no coverage report for the extension.
