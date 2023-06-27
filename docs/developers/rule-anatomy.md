# Rule Anatomy
A rule is just a Javscript files that returns a factory function. The object returned by the factory should be in accordance with this type:
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
