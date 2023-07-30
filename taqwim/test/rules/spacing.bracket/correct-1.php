<?php

$empty_array = [];
$array = [1, 2, 3];
$string_array = ['foo', 'bar', 'baz'];
$associative_array = ['foo' => 'bar', 'baz' => 'qux'];
$nested_array = ['foo' => ['bar' => 'baz']];
$array_of_arrays = ['single', ['foo' => 'bar'], 'middle', ['baz' => 'qux']];
$nested_array_of_arrays = ['foo' => ['bar' => ['baz' => 'qux']]];

$value_1 = $array[0];
$value_2 = $string_array[1];

class Test extends Testing {
	function construct($info)
	{
		$this->data['test']= $info['test'];
		$this->data['foo'] = $info['foo'];
		$this->data['bar'] = $info['bar'];
		$this->data['baz']['nested'] = $test;
		$this->data['baz']['nested']= $info['baz']['nested'];
		$this->data['baz']['nested'][] = $info['baz']['nested']['foo'];

		parent::__construct(['a' => 1, 'b' => 2]);
	}
}

// Correct because it is handled by `spacing.assignment` rule.
$foo['bar']= 'baz';
$foo['bar']  ='baz';
