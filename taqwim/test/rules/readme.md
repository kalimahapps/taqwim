# Rules folder
This folder is to test the rules of taqwim. It is structured similar to the rules folder (the one that contains the code for the rules). Each rule should have a related folder here. The folder name follows the rule name (without the preset). 

For examples, rule `psr/spacing.paren` should have a folder named `spacing.paren`. Each folder here should include a `data.json` file which contains the metadata required for the test file to process. Each key should represent an option in the rule. And each of these keys should have an object which keys represent the related file name (without the extension). The properties of these objects should be two `description` and `expected` (refer to how many warnings are expected). For no options use `default` key. 

`data.json` is also used by `update-rules` script to copy these test examples into docs. If you don't want to include a test example in the docs, add `extra-tests` object.

You can provide a `expectedCallback` key instead of `expected` to provide a callback function to calculate the expected value. This callback function will be called with the following arguments:
- `expect`: the expect function from vite
- `lintResults`: the lint results from the rule

Example:
```json
{
  "default": {
	"test1": {
	  "description": "This is a test",
	  "expected": 1
	},
	"test2": {
	  "description": "This is another test",
	  "expected": 0
	}
  },
  "option1": {
	"option-test1": {
	  "description": "This is a test",
	  "expected": 1
	},
  },
  "extra-tests": {
	"test3": {
	  "description": "This is an extra test",
	  "expected": 0
	}
  }
}
```
