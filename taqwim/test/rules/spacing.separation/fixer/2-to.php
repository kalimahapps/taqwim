<?php
define("FOO", "something");
define("FOO2", "something else");
define("FOO_BAR", "something more");

const CONSTANT = 'constant value', CONSTANT2 = 'another constant';
const CONSTANT1 = 'constant value'
, CONSTANT2 = 'another constant';


function test($a, $b, $c
, $d) {
		return;
}

function test2($a, $b, $c, $d = 'default' ) {
  echo "test {$a}", "echo statement";
  echo "one more";
  return Testing;
}

class Test {
    const CONSTANT = 'constant value', CONSTANT2 = 'another constant';
    
	public function getData($a, $b, $c, $d) {
		echo "$a";
        echo $b;
        return $d;
	}
	
	public function getData2($a, $b, $c
, $d = 'default') {
		echo $a, $c;
	}
}

class ClassName
{
    public function aVeryLongMethodName(
        ClassTypeHint $arg1, 
        &$arg2,
        array $arg3 = []
    ) {
        return $arg1->foo($arg2, $arg3);
    }
}

Foo::bar($arg1,
$arg2, $arg3, $arg4);

$foo->bar(
    $longArgument,
    $longerArgument,
    $muchLongerArgument
);

$foo->bar($arg1, "string {$arg2} string", $arg3)->
    bar($arg4)->moreArguments($arg5, $arg6, $arg7);
    
$closureWithArgsAndVars = function ($arg1, $arg2) use ($var1, $var2, $var3) {
    return;
};

$closureWithArgsVarsAndReturn = function ($arg1
, $arg2, $arg3) use ($var1, $var2): bool {
    // body
};

$closureWithArgsAndVars = function ($arg1, $arg2) use ($var1, $var2, $var3) {
    // body
};

$closureWithArgsVarsAndReturn = function ($arg1, $arg2, $arg3) use ($var1, $var2): bool {
    // body
};