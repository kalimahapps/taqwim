<?php
$var = $a + $b;
$var = $a / $b;
$var = $a - $b;
$var = $a * $b;
$var = $a % $b;
$var = $a ** $b;
$var = $a . $b;
$var = $a . $b . $c;
$var = $a / $b * $c + $d;
$var = $a + $b / $c * $d;

$var = $a + $b % $c ** $d - $e;

$var = $a + 
    $b % $c * $d - $e;

$var =
$a + $b % $c * $d - $e;

$var = ($b = 4) + 5;
$var -= $a;
$var += $a;
$var *= $a;
$var /= $a + $b;
$var %= $a ** $b;
$var **= $a;
$var .= $a;
$var &= $a;
$var |= $a;
$var ^= $a;
$var <<= $a;
$var >>= $a;
$var ??= $a;

for ($i = 0; $i < 10; $i++) {
}

for($i = 0,$j = 0; $i < 10; $i++,$j++) {
}

foreach ($files as $file) {
    $saves[$file] = array();
    $contents = stripslashes(file_get_contents($file));
    list($assetid, $time, $content) = explode("\n", $contents);
    $saves[$file]['assetid'] = $assetid;
    $var >>= $a;
    
    $var ??= $a;
}

if($test === true){
    $object->property = $a;
    $object->another_property = $b;
    $a = $object->call_function();
}


class Test{
	function construct($info)
	{
		$this->data['test'] = $info['test'];
		$this->data['foo'] = $info['foo'];
		$this->data['bar'] = $info['bar'];
		$this->data['baz']['nested'] = $test;
		$this->data['baz']['nested'] = $info['baz']['nested'];
		$this->data['baz']['nested'][ ] = $info['baz']['nested']['foo'];
	}
}
$associative_array['foo'] = 'qux';
$associative_array['baz'] = 'bar';
$string_array[0] = 'qux';

$access_array = $associative_array['foo'];

$array[0] = $a;
$array[1]['property'] = $b;
$array[2]['another_property'] = $c;
$array[3]['another_property'] = $d;

$object->property = $a;
$object->another_property = $b;
$object->another_property = $c;
$object->another_property->nested_property = $d;