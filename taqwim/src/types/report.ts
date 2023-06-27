import type Fixer from '@taqwim/fixer';
import type { Start, End } from './loc';

interface ReportData {
	message: string;
	position: {
		start: Start,
		end: End,
	};
	severity?: 'error' | 'warning' | 'off';
	fix?: (fixer: Fixer) => string;
	ruleName?: string;
	hasFix?: boolean;
}

interface Report {
	file?: string;
	reports: ReportData[];
	sourceCode: string;
}

export type {
	Report,
	ReportData
};