<?php
/* taqwim "psr/spacing.pair": {align: true} */
list("a" => $a) = $b;

list(
    "first" => $a,
    "b" => $b,
"third_variable" => $c    )
= $d;

list($drink, $color, $power) = $info;
list($drink, , $power) = $info;

list($a, list(2 => $two,
3 => $three)) = array(1, array(2, 3));

list(1 => $second, 3 => $fourth) = array(1, 2, 3, 4);

list(
    $a,
    list("php" => $first_language,
        "javascript" => $second_language,
    )
) = array(1, array("php", "python", "javascript", "c++"));