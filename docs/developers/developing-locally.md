# Developing Locally

To run the project locally, clone the project then install the dependencies:

```bash
npm install
```

The project will install the dependencies for both the VSCode extension and the npm package (CLI).

:::warning
Only use npm for installing dependencies, because the VSCode extension does not work well with other package managers.
:::

Restart VSCode to load the extension after installing the dependencies.

The project runs two tasks to build the VSCode extension and the npm package (CLI).

## Running CLI Locally

Since the CLI is built through a task, you can use the dist build to run it.
To run the CLI locally, use the following command:

```bash
node ./dist/cli/index.js
```

This is basically the same as running the `taqwim` command after installing the package globally. You can use the same options as described in the [CLI](../cli.md) page.