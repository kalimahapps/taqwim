<?php
/* taqwim "psr/spacing.pair": {align: true} */
list("a" => $a) = $b;

list(
    "first"          => $a,
    "b"              => $b,
"third_variable" => $c    )
= $d;

list($drink, $color, $power) = $info;
list($drink, , $power) = $info;

list($a, list(2 => $two,
3 => $three)) = array(1, array(2, 3));

list(1 => $second, 3 => $fourth) = array(1, 2, 3, 4);

list(
    $a,
    list("php"        => $first_language,
        "javascript" => $second_language,
    )
) = array(1, array("php", "python", "javascript", "c++"));

match($version) {'php' => 10, 'typescript' => '6', 'python' => 3.9};

match ($food) {
    'apple_juice'  => 'This food is an apple',
    'orange_fruit' => 'This food is a orange',
    'cake'         => 'This food is a cake',
};

match($month_name) {
    'january'   => 31,
    'february'  => is_leap_year($year) ? 29 : 28,
    'march'     => 31,
    'april'     => 30,
    'may'       => 31,
    'june'      => 30,
    'july'      => 31,
    'august'    => 31,
    'septemper' => 30,
    'october'   => 31,
    'november'  => 30,
    'december'  => 31,
    default     => throw new InvalidArgumentException("Invalid month"),
};

$result = match ($x) {
        $a, $b, $c => 5,
        $a         => 5,
        $b         => 5, $c         => 5,
        $a,
        $b, $c     => 5,
    };

$expression_result = match ($condition) {
        1, 2    => foo(),
        3, 4    => bar(),
        default => baz(),
    };

$condition = 5;
try {
    match ($condition) {
        "first", "second" => foo(),
        3, 4              => bar(),
    };
} catch (\UnhandledMatchError $e) {
    var_dump($e);
}