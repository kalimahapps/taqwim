type MatchType = {
	line: number,
	column: number,
	offset: number,
};

type MatchGroupType = {
	[key: string]: {
		start: MatchType,
		end: MatchType,
		value: string,
	} | undefined
};

type RangeMatchType = {
	start: MatchType,
	end: MatchType,
	value: string,
	groups?: MatchGroupType
};

export type {
	MatchType,
	MatchGroupType,
	RangeMatchType
};