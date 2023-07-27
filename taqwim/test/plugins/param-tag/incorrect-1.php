<?php

/**
 * Calculate sum of three numbers.
 *
 * @param int $first
 * @param int $second Second number
 * @return int Sum of three numbers
 */
function calc($first, $second, $third) {
    return $first + $second + $third;
}

/**
 * Calculate sum of three numbers.
 * 
 * @param int $first
 * @param $second Second number
 * @return int Sum of three numbers
 */
function calc2($first, $second, $third) {
    return $first + $second + $third;
}


/**
 * Calculate sum of three numbers.
 *
 * @param string $first
 * @param string $second Second number
 * @return int Sum of three numbers
 */
function calc3(string $first, $second, $third) {
    return $first + $second + $third;
}

/**
 * Calculate sum of three numbers.
 *
 * @param string $first
 * @param string $second Second number
 * @param string $third third number
 * @param string $fourth fourth number
 *
 * @return int Sum of three numbers
 */
function calc4(string $first, int $second, $third) {
    return $first + $second + $third;
}

/**
 * Calculate sum
 *
 * @param string $first First number
 * @param string $second Second number
 *
 * @return int Sum of numbers
 */
function calc5(string $first, int|string $second) {
    return $first + $second + $third;
}

/**
 * Multiply numbers
 *
 * @param string $first First number
 * @param string $second Second number
 *
 * @return int Result
 */
function calc6(string $first, ReturnValue&AnotherValue $second) {
    return $first * $second;
}

function functionWithNoParamsOrBody(){
    
}