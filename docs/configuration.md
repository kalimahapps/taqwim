# Configration
While PHPTaqwim is a zero-configuration tool, it can be configured to fit your needs. The configuration file is a JavaScript file that exports an object. The configuration file should be named `.taqwim.json` or `taqwim.config.js` and be placed in the root directory of your project.

If both files exist, `.taqwim.json` will be used.

For the VSCode extension, the configuration file should be placed in the root directory of your workspace. And for the CLI, the configuration file should be placed in the current working directory (where you run the command from).