import type { LocOffset } from './types/index';

class Fixer {
	sourceCode: string;
	constructor(sourceCode: string) {
		this.sourceCode = sourceCode;
	}

	setSourceCode(sourceCode: string) {
		this.sourceCode = sourceCode;
		return this;
	}

	replaceRange(loc: LocOffset, text: string): string {
		const { start, end } = loc;

		if (!start || !end) {
			return this.sourceCode;
		}

		const { offset: startOffset } = start;
		const { offset: endOffset } = end;

		const startText = this.sourceCode.slice(0, startOffset);
		const endText = this.sourceCode.slice(endOffset);

		const newText = `${startText}${text}${endText}`;
		return newText;
	}

	removeRange(loc: LocOffset): string {
		return this.replaceRange(loc, '');
	}

	before(loc: LocOffset, text: string): string {
		const { start } = loc;

		if (!start) {
			return this.sourceCode;
		}

		const { offset: startOffset } = start;

		const startText = this.sourceCode.slice(0, startOffset);
		const endText = this.sourceCode.slice(startOffset);

		const newText = `${startText}${text}${endText}`;
		return newText;
	}

	after(loc: LocOffset, text: string): string {
		const { end } = loc;

		if (!end) {
			return this.sourceCode;
		}

		const { offset: endOffset } = end;

		const startText = this.sourceCode.slice(0, endOffset);
		const endText = this.sourceCode.slice(endOffset);

		const newText = `${startText}${text}${endText}`;
		return newText;
	}
}

export default Fixer;