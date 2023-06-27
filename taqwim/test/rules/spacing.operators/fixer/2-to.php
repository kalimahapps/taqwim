<?php

if ($var instanceof PHP_CodeSniffer) {
}

if (($var instanceof PHP_CodeSniffer) === false) {
}

if ($good && ($var instanceof PHP_CodeSniffer) === false && $good) {
}

if ($good === true && ($var instanceof PHP_CodeSniffer) === false) {
}


$var1 === TRUE
    ? $var2 = 0
    : $var2 = 1;

$var1 === TRUE ? $var2 = 0 : $var2 = 1;

$var1 
=== TRUE ? $var2 = 0 : $var2 = 1;

if ($var2 === TRUE) {
    $var1 === TRUE ? $var2 = 0 : $var2 = 1;
}

$var1 === TRUE ? $var2 = 0 : $var2 = 1;

$var1
    ? $var2 = 0 : 
	$var2 = 1;

($var1 === true) ? $var2 = 0 : $var2 = 1;


$var1 ? $var2 = 0 : $var2 = 1;

if ($var2 === TRUE) {   $var1 ? $var2 = 0 : $var2 = 1;
}

$var1 === TRUE ?: $var2;
$var = ($var1) ?: "foobar";
$var = ($var1)
?: "foobar";

$var = $var1 ?: $test ?: $test2;
$var = $var1 ?: $test ? $test2 : $test3;


myFunction($var1 === true ? "" : "foobar");
