<?php
FunCtion test() {
	Global $var;
	
	echo "Function keyword is not lowercase";
	
	RETURN $var;
}

SWITCH($var):
	CASE 1:
		echo "1";
		BREAK;
	CASE 2:
		echo "2";
		BREAK;
	DEFAULT:
		echo "default";
		BREAK;
ENDSWITCH;

TRY {
    THROW NEW Exception('Some message');
} CATCH (Exception $e) {
    echo $e->getMessage();
}

try {
    NEW className();
} catch(Exception $e){
    echo $e->getMessage();
}

IF(true): 
  FOREACH($element as $key => $value):
	ECHO "$KEY";
  ENDFOREACH;
ENDIF;