<?php

if    (     $expr1    )      {
    // if body
}elseif     (        $expr2) {
    // elseif body
} else {
    // else body;
}

if (
    $expr1
    && $expr2
       ) {
    // if body
} elseif (
    $expr3
    && $expr4
    ) {
    // elseif body
}

switch (    $expr  ) {
    case 0:
        echo 'First case, with a break';
        break;
    default:
        echo 'Default case';
        break;
}

if ( ! defined(  'ABSPATH' )  ){
	exit;
}

if (   isset( $args['name']) || isset($args['value'])   ) {
	throw new ErrorException('Remove name or value from args keys');
}

if( (   $test > 1  ) && (  $test < 10   ) ){
	echo 'The result is 9';
}

if ((   1 + 2 ) *   3 ) {
    echo 'The result is 9';
}


if (  isset(  $var  )  ){
    echo 'The result is 1';
}