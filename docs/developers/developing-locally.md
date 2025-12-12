# Developing locally
To run the project locally, clone the project then install the dependencies:
```bash
npm install
```
Project will install the dependencies for both the VSCode extension and the NPM package (CLI).

::: warning
Only use npm for installing dependencies, because VSCode extension does not work well with other package managers.
:::

Retart the VSCode to load the extension after installing the dependencies.

The project runs two tasks to build the VSCode extension and the NPM package (CLI).

### Running CLI locally
Since CLI is built throw task, you can use the dist built to run it.
To run the CLI locally, use the following command:
```bash
node ./dist/cli/index.js
```
This is basically the same as running `taqwim` command after installing the package globally. You can use the same options as described in the [CLI](../cli.md) page.