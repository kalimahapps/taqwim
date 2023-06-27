// values are zero-indexed
type Start = {
	line: number;
	column: number;
	offset: number;
};

type End = {
	line: number;
	column: number;
	offset: number;
};

type Loc = {
	start: Start;
	end: End;
};

type LocOffset = {
	start: Partial<Start> & { offset: number };
	end: Partial<End> & { offset: number };
};

export type {
	Loc,
	LocOffset,
	Start,
	End
};
