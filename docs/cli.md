# npm package (CLI)

PHPTaqwim can be used as an npm package (CLI). This has the advantage of integrating it with your build process. For example, you can use it as a pre-commit hook to make sure that the committed code is linted and formatted.

## Installation
```bash
pnpm add @kalimahapps/taqwim -D
```
or
```bash
npm install @kalimahapps/taqwim -D
```

## Options
In addition to the list of options below, you can run `taqwim --help` to see the options in the console.
<!--@include: ./cli-options.md-->

## Examples
:::tip
Wrap any provided string with double quotes (`"`) to avoid any issues with the shell.
:::

### Lint a file
```bash
taqwim --path=./path/to/file.php
```

### Lint a directory
```bash
taqwim --path=./path/to/directory
```

### Lint a file and write the report to a file
```bash
taqwim --path=./path/to/file.php --report-file=./path/to/report.json
```

### Lint a file and apply fixes
```bash
taqwim --path=./path/to/file.php --fix
```

### Lint specific rules
```bash
taqwim --path=./path/to/file.php --rules=rule-name,another-rule-name
```

### Lint a file on a specific line
```bash
taqwim --path=./path/to/file.php --line=10
```