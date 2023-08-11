<?php
class Test {
	private $test = 'test';
	public $test2 = 'test2';

	private function test($data = array(), $value = '', $third){
		echo 'test';
	}
}

function test($first, string $second = 'Testing', int $third) {
    echo 'Test';
}

function multiLine(
	$first,
	string $second = 'Testing',
	int $third
) {
	echo 'Test';
}

function multiDefaultParams(
	$first,
	string $second = 'Testing',
	int $third = 1
) {
	echo 'Test';
}