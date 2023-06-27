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
