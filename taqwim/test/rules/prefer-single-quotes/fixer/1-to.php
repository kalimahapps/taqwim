<?php

$string = 'This is a string';
$concat = 'This is a string concatenated with' . 'another string';
$empty_string = '';

echo strlen('Hello world!');
echo str_word_count('Hello world!');
echo strpos('Hello world!', 'world');

echo 'Hello world!';
echo 'First character of this string is: ' . $string[0];
echo 'Multiple strings' . ' concatenated' . ' together';
echo 'Multiple echo statements', ' concatenated', ' together';

echo 'A string
that spans
multiple lines';

echo "A string with new lines\nand tabs\t characters inside";
echo "A string with a single quote ' inside";

$array = array(
	'key' => 'value',
	'key2' => 'value2',
	'key3' => 'value3',
);

$nested_array = array(
	'key' => 'value',
	'key2' => 'value2',
	'key3' => array(
		'key' => 'value',
		'key2' => 'value2',
		'key3' => 'value3',
	),
);

list('key' => $key, 'key2' => $key2, 'key3' => $key3) = $array;

$object->callMethod('string', 'string2', 'string3');