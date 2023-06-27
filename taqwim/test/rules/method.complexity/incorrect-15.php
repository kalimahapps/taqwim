<?php
function complexityFifteenWithMatch()
{
	return match(strtolower(substr($monthName, 0, 3))) {
		'jan' => 31,
		'feb' => is_leap_year($year) ? 29 : 28,
		'mar' => 31,
		'apr' => 30,
		'may' => 31,
		'jun' => 30,
		'jul' => 31,
		'aug' => 31,
		'sep' => 30,
		'oct' => 31,
		'nov' => 30,
		'dec' => 31,
		default => throw new InvalidArgumentException("Invalid month"),
	};
}
