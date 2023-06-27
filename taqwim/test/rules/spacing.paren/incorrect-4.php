<?php
class ReturnTypeVariations
{
    public function functionName   (    int $arg1, $arg2  ) : string
    {
        return 'foo';
    }

    public function anotherFunction  (
        string $foo,
        string $bar,
        int $baz
    ) : string {
        return 'foo';
    }
}


function testingSpace   (   $Hello   ){
	echo "HELLO";
}

$closureWithArgs = function  (  $arg1, $arg2  ) {
    // body
};

$closureWithArgsAndVars = function (   $arg1, $arg2  ) 
use  (  $var1, $var2  ) {
    // body
};

$closureWithArgsVarsAndReturn = function  (   $arg1, $arg2) use ($var1, $var2   ) : bool {
    // body
};


callFunction  ( "HI", "HELLO"  );
$this->goAhead  ("one", "two");

callFunction(  );