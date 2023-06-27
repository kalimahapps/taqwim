<?php
class Test{
	public function test(?bool $a, $b, $c,
	$d = '', int $e): string
	{}
	
	public function test1(?array $a, int $b, bool $c, ?string $d = ''): ?bool {
	}
	
	public function test2(bool $a,
	int $b,
	bool $c,?string $d = '') {
	}
	
	public function test3(?bool $a, $b, $c,
	$d = '', int $e): string
	{}
}


function test(array $a, int $b, bool $c,  string $d = ''): ?string {
}

function test1(?array $a, int $b, bool $c, ?string $d = ''): ?bool {
}

function test2(bool $a, 
int $b,
bool $c,?string $d = '') {
}

function test4(): bool{}

function test3(?bool $a, $b, $c,
$d = '', int $e): string
{}

