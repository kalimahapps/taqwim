<?php
IF(true){
  FOREACH($element as $key => $value){
    ECHO "$KEY";
  }
}

For($i = 0; $i < 10; $i++){
	if($i === '5'){
		CONTINUE;
	}
	
  ECHO "$i";
}


IF(true){
	echo "true";
} ELSEIF(false){
	echo "false";
} ELSE {
	echo "Neither true nor false";
}