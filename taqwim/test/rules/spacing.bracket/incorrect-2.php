<?php
$add = $array[0]+$array[1];
$subtract = $array[0]  -$array[1];
$multiply = $array[0]*$array[1];
$divide = $array[0] /$array[1];
$modulus = $array[0]%  $array[1];
$concatenate = $array[0].$array[1];
$exponentiate = $array[0]   **$array[1];
$bitwise_and = $array[0]&$array[1];
$bitwise_or = $array[0]|$array[1];
$bitwise_xor = $array[0]   ^$array[1];
$bitwise_shift_left = $array[0]<<$array[1];
$bitwise_shift_right = $array[0]   >>$array[1];

$smaller = $array[0]<$array[1];
$smaller_or_equal = $array[0]<=$array[1];
$greater = $array[0]>$array[1];
$greater_or_equal = $array[0]   >=$array[1];
$equal = $array[0]==   $array[1];
$identical = $array[0]===   $array[1];
$not_equal = $array[0]!=$array[1];
$not_identical = $array[0]    !==    $array[1];


$or = $array[0]   ||$array[1];
$and = $array[0]&&   $array[1];
$ternary = $array[0]?$array[1]:   $array[2];
$null_coalesce = $array[0]??   $array[1];
