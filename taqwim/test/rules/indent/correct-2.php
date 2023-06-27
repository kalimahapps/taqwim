<?php

/**
* This is a test function 
* 
 * @param int $repeat The number of times to repeat the string
* @return string The repeated string
 */
function test($repeat)
{
    if(true){
        $o = <<<EOF
this is some text
this is some text
this is some text
this is some text
this is some text
this is some text
EOF;
    }
    return $o;
}


$repeated = functionIndent(
    2334,
    566,
    "string"
);

if ($a === true || $a === true || $a === true || $a === true ||
    $a === true || $a === true || $a === true || $a === true) {

    echo 'hello';
}

if ($true) {
    /* First comment line
    * 
    * Comment test here
    * Comment test here
    * 
    */

    /* First comment line
    * 
    * Comment test here
    * Comment test here
    * 
    this si something */
}

$test = $variable === true ? 'True' : 'False';
$ternary =
    $test === 'True'
    ?
    'Go Ahead' :
    'Stop';

$this->test(
    $variable === 'testing'
    ? 'debug' :
    'production');

$ternary =
    $test === 'True'
    ? $value === 'True'
        ? 'Go Ahead' :
        'Stop'
    : 'Stop';

function testNoop()
{
    /* taken from http://de3.php.net/manual/en/reserved.php */
    # $m[] = 'declare';
    /* taken from http://de3.php.net/manual/en/reserved.php */
    # $m[] = 'declare';
}

function testNoop2(){// noop function
}

foreach ($elements as $element) {
    if ($something) {
        // Do IF.
    } else if ($somethingElse) {
        // Do ELSE.
    }
}

foreach ($elements as $element) {
    // Foreach with a comment
    echo ($element) ? 'true' : 'false';
}

if ($condition) {
    echo "This is a long
string that spans $numLines lines
without indenting.
";
}

if ($condition) {
    echo 
'This is a long
    string that spans multiple lines
    with indenting.
    ';
}

if ($condition) {
    echo 'This is a long
          string that spans multiple lines
          with indenting.';
}