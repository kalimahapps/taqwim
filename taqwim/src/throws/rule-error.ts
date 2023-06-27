class RuleOptionError extends Error {
	public ruleName: string;

	public optionName: string;

	public optionValue: unknown;

	constructor(
		message: string,
		ruleName: string,
		optionName: string,
		optionValue?: unknown
	) {
		super(message);
		this.name = this.constructor.name;
		this.ruleName = ruleName;
		this.optionName = optionName;
		this.optionValue = optionValue;
	}
}

export {
	RuleOptionError
};