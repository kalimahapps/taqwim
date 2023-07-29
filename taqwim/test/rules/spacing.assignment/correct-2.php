<?php
foreach ($files as $file) {
    $saves[$file] = array();
    $contents = stripslashes(file_get_contents($file));
    list($id, $time, $content) = explode("\n", $contents);
    $saves[$file]['id'] = $id;
    $var >>= $a;
    
    $var ??= $a;
}

if($test === true){
    $object->property = $a;
    $object->another_property = $b;
    $a = $object->call_function();
}

$array[0] = $a;
$array[1]['property'] = $b;
$array[2]['another_property'] = $c;
$array[3]['another_property'] = $d;

$object->property = $a;
$object->another_property = $b;
$object->another_property = $c;
$object->another_property->nested_property = $d;