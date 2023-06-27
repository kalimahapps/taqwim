<?php

list("a" => $a) = $b;

list(
    "first" => $a,
    "b" => $b,
"third_variable" => $c    )
= $d;


list($a, list(2 => $two,
3 => $three)) = array(1, array(2, 3));

list(1 => $second, 3 => $fourth) = array(1, 2, 3, 4);

list(
    $a,
    list("php" => $first_language,
        "javascript" => $second_language,
    )
) = array(1, array("php", "python", "javascript", "c++"));

match($version) {'php' => 10, 'typescript' => '6', 'python' => 3.9};

match ($food) {    'apple' => 'This food is an apple',
    'orange'
       => 'This food is a orange',
    'cake' => 'This food is a cake',
};

match($month_name) {    'jan' => 31,
    'feb' => is_leap_year($year) ? 29 : 28,
    'mar' => 31,
    'apr' => 30,
    'may'  
    => 31, 'jun' => 30, 'jul' => 31,
    'aug' => 31,
    'sep' => 30,
    'oct' => 31, 'nov' => 30,
    'dec' => 31,    default => throw new InvalidArgumentException("Invalid month"),
};

$result = match ($x) {
    // This match arm:
    $a, $b, $c
=> 5,
    // Is equivalent to these three match arms:
        $a => 5,
    $b => 5,   $c => 5,
};

$expressionResult = match ($condition) {
    1,2 => foo(),
3,4 => bar(),
    default => baz(),
};

$condition = 5;
try {
    match ($condition) {
        1, 2 => foo(),
        3, 4 => bar(),
    };
} catch (\UnhandledMatchError $e) {
    var_dump($e);
}