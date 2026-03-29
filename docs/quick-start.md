# Quick Start

Get started with PHPTaqwim in just a few minutes!

## VSCode Extension

### 1. Install

Open VSCode and install the Taqwim extension:
- Press `Ctrl+Shift+X` (or `Cmd+Shift+X` on Mac)
- Search for "Taqwim"
- Click "Install"

### 2. Start Linting

That's it! Open any PHP file and Taqwim will automatically:
- Show diagnostic messages for issues
- Highlight coding standard violations
- Provide suggestions for fixes

### 3. Format Your Code

To format a PHP file:
- Open a PHP file
- Press `Shift+Alt+F` (or `Shift+Option+F` on Mac)
- Or right-click and select "Format Document"

::: tip
Set Taqwim as your default PHP formatter in settings:
```json
{
  "[php]": {
    "editor.defaultFormatter": "kalimahapps.taqwim"
  }
}
```
:::

## CLI

### 1. Install

Install Taqwim as a development dependency:

```bash
npm install @kalimahapps/taqwim -D
```

### 2. Lint a File

```bash
npx taqwim --path=./path/to/file.php
```

### 3. Auto-fix Issues

```bash
npx taqwim --path=./path/to/file.php --fix
```

### 4. Lint a Directory

```bash
npx taqwim --path=./src
```

## Configuration (Optional)

Taqwim works with zero configuration, but you can customize it by creating a `taqwim.config.js` or `.taqwim.json` file in your project root.

Example `taqwim.config.js`:

```javascript
export default {
  preset: 'psr',
  rules: {
    'psr/indent': {
      type: 'tabs',
      length: 1
    }
  }
};
```

For more configuration options, see the [Configuration](./configuration.md) guide.

## Next Steps

- [Learn about Configuration](./configuration.md)
- [Explore CLI Options](./cli.md)
- [View Available Rules](./rules/psr.md)
- [Contributing Guide](./developers/developing-locally.md)

## Need Help?

- [View Documentation](https://taqwim.kalimah-apps.com/docs/)
- [Report Issues](https://github.com/kalimahapps/taqwim/issues)
- [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=kalimahapps.taqwim)
