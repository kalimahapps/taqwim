<?php
foreach ($files as $file) {
    $saves[$file]= array();
    $contents =stripslashes(file_get_contents($file));
    list($id, $time, $content)   = explode("\n", $contents);
    $saves[$file]['id']= $id;
    $var>>=$a;
    
    $var??=   $a;
}

if($test === true){
    $object->property=$a;
    $object->another_property   =$b;
    $a=$object->call_function();
}


class Test extends Testing {
	function construct($info)
	{
		$this->data[ 'test'] = $info[ 'test'];
		$this->data ['foo'] = $info[  'foo'];
		$this->data ['bar' ] = $info[ 'bar'];
		$this->data  [ 'baz' ]  ['nested'] = $test;
		$this->data[ 'baz']['nested']= $info['baz']  ['nested'];
		$this->data   ['baz'  ][ 'nested'][ ] = $info  [  'baz'] ['nested'  ]   [ 'foo'];
		
		parent::__construct( [ 'a' => 1, 'b' => 2  ]);
	}
}

$associative_array[ 'foo'] = 'qux';
$associative_array[ 'baz'] = 'bar';
$string_array[0] = 'qux';

$access_array = $associative_array  [  'foo'];

$array[0]=$a;
$array[1]['property']=  $b;
$array['string_key']['another_property']  =$d;

$object->property=  $a;
$object->another_property =$b;
$object->another_property->nested_property=$d;