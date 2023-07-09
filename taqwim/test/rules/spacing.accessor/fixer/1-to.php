<?php
$b->foo = 2;
echo $a->foo."\n";

$d->foo = 2;
echo $c->foo."\n";

function foo($obj) {
    $obj->foo = 2;
}

echo $e->foo."\n";

$this->callFirst("one", "two")->  
callSecond("three", "four")
->callThird("five", "six");

$this->callFirst("one", "two")->callSecond("three", "four")
->callThird("five", "six");

ClassName::callFirst("one", "two")->callSecond("three", "four");

A::b;
ClassName::
	classProperty;