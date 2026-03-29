# Usage

PHPTaqwim can be used in two ways: as a VSCode extension or as an npm package (CLI).

## VSCode Extension

### Installation

1. Open VSCode
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "Taqwim"
4. Click Install

### Features

Once installed, the extension will automatically:
- Show diagnostic messages for PHP files
- Highlight coding standard violations
- Provide quick fixes for common issues

### Formatting PHP Files

To use Taqwim as your default formatter for PHP files:

1. Open a PHP file
2. Right-click in the editor
3. Select "Format Document With..."
4. Choose "Taqwim" as the default formatter

Alternatively, you can set it in your VSCode settings:

```json
{
  "[php]": {
    "editor.defaultFormatter": "kalimahapps.taqwim"
  }
}
```

## NPM Package (CLI)

### Installation

Install the package as a development dependency:

```bash
npm install @kalimahapps/taqwim -D
```

or with pnpm:

```bash
pnpm add @kalimahapps/taqwim -D
```

### Basic Usage

Run the CLI with:

```bash
taqwim --help
```

For detailed CLI options and examples, check the [CLI documentation](./cli.md).

## Configuration

PHPTaqwim will try to find a configuration file (`taqwim.config.js` or `.taqwim.json`) in the current directory. If it's not found, it will use the default configuration.

To learn how to configure PHPTaqwim, check the [Configuration](./configuration.md) page.