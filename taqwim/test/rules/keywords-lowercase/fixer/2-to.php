<?php
function test() {
	global $var;
	
	echo "Function keyword is not lowercase";
	
	return $var;
}

switch($var):
	case 1:
		echo "1";
		break;
	case 2:
		echo "2";
		break;
	default:
		echo "default";
		break;
endswitch;

try {
    throw new Exception('Some message');
} catch (Exception $e) {
    echo $e->getMessage();
}

try {
    new className();
} catch(Exception $e){
    echo $e->getMessage();
}

if(true): 
  foreach($element as $key => $value):
	echo "$KEY";
  endforeach;
endif;