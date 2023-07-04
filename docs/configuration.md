# Configration
While PHPTaqwim is a zero-configuration tool, it can be configured to fit your needs. Configration can be added using a didicated configuration file or by using inline comments throughout your code.

## File configuration
Configuration file can be either a JavaScript file, named `taqwim.config.js`, that exports an object or a json file, named `.taqwim.json`, that contains a JSON object. It needs to be placed in the root directory of the project. If both files exist, `.taqwim.json` will have prcedence.

For the VSCode extension, the configuration file should be placed in the root directory of workspace. And for the CLI, the configuration file should be placed in the current working directory (where you run the command from).

## Inline configuration
:::warning
Only block comments /**/ is supported. Single line comments, using //, is not supported.
:::

### Change rules configuration
Inline configuration can be added using comments. The comment should start with `taqwim` followed by a space and then the configuration.

:::tip
Configuration should vaid JSON. No need to add opening and closing braces.
:::

For example:
```js
/* taqwim "psr/indent" :{type: "tabs", length: 1 } */
```

You can add multiple rules in the same comment:
```js
/* taqwim "psr/indent" :{type: "tabs", length: 1 }, "psr/brace-style" :{type: "1tbs"} */
```

### Disable a specific line
To disable taqwim for a specific line, use `taqwim-disable-next-line` instead of `taqwim`:
```js
/* taqwim-disable-next-line */
```

You can disable a specific rule for a specific line:
```js
/* taqwim-disable-next-line psr/indent */
```

or disable multiple rules by separating them with a comma:
```js
/* taqwim-disable-next-line psr/indent,psr/brace-style */
```

### Disable a specific block
To disable taqwim for a specific block, use `taqwim-disable` and `taqwim-enable`:
```js
/* taqwim-disable */
// Code here will not be formatted
/* taqwim-enable */
```

You can disable a specific rule for a specific block:
```js
/* taqwim-disable psr/indent */
// Code here will not be formatted
/* taqwim-enable psr/indent */
```

or disable multiple rules by separating them with a comma:
```js
/* taqwim-disable psr/indent,psr/brace-style */
// Code here will not be formatted
/* taqwim-enable psr/indent,psr/brace-style */
```

:::warning
If no rules is specified in `taqwim-enable`, all rules will be enabled.
:::
