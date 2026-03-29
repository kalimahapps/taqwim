# Rule Anatomy

A rule is a JavaScript file that exports a factory function. The object returned by the factory function should conform to the `RuleData` interface:

```typescript
interface RuleData {

	/**
	 * The name of the rule
	 */
	name: string;

	/**
	 * List of rule names that this rule depends on
	 * The rule can supply an array of rule names
	 * or a function that returns an array of rule names
	 */
	register: string[] | (() => string[]);

	/**
	 * Meta data for the rule
	 */
	meta: {
		fixable: boolean;
		description: string;
		url?: string;
		preset: string;
	};

	/*
	 * Callback to process the rule. It will run
	 * for each node in register list
	 */
	process?: (context: RuleContext) => void;

	/*
	 * Callback to process the rule before the
	 * process callback. It will run once
	 * per rule
	 */
	pre?: (context: RulePreContext) => void;

	/*
	* Callback to process the rule after the
	* process callback. It will run once
	* per rule
	*/
	post?: (context: RulePostContext) => void;

	/**
	 * A class to bind to the rule
	 */
	bindClass?: { new(): any };
}
```

## Example Rule

Here's a basic example of a rule that checks for trailing whitespace:

```javascript
export default () => {
	return {
		name: 'no-trailing-whitespace',
		register: ['Program'],
		meta: {
			fixable: true,
			description: 'Disallow trailing whitespace at the end of lines',
			preset: 'taqwim'
		},
		process(context) {
			// Rule logic here
			// Use context to access node information and report issues
		}
	};
};
```

## Rule Properties

- **name**: Unique identifier for the rule
- **register**: Array of AST node types that trigger the rule's `process` callback
- **meta**: Metadata about the rule including whether it's fixable and its description
- **process**: Main callback that runs for each registered node type
- **pre**: Optional callback that runs once before processing
- **post**: Optional callback that runs once after all processing is complete
- **bindClass**: Optional class to bind to the rule for more complex logic
