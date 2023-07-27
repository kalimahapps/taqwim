<?php

/**
 * Calculate sum of three numbers
 * 
 * @param int $first First number
 * @param int $second Second number
 * @param int $third Third number
 * @return int Sum of three numbers
 */
function calc($first, $second, $third) {
	return $first + $second + $third;
}

/**
 * Calculate sum of three numbers
 * 
 * @param int $first First number
 * @param int|string $second Second number
 * @param FirstType&SecondType $third Third number
 * @return int Sum of three numbers
 */
function functionWithIntersectionType(int $first, int|string $second, FirstType&SecondType $third) {
	return $first + $second + $third;
}

/**
 * Calculate sum of three numbers
 * 
 * @param int $first First number
 * @param int|string $second Second number
 * @param FirstType|SecondType $third Third number
 * @return int Sum of three numbers
 */
function functionWithUnionType(int $first, int|string $second, FirstType|SecondType $third) {
	return $first + $second + $third;
}