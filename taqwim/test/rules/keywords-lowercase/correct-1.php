<?php
if(true){
  foreach($element as $key => $value){
    echo "$KEY";
  }
}

for($i = 0; $i < 10; $i++){
	if($i === '5'){
		continue;
	}
	
  echo "$i";
}


if(true){
	echo "true";
} elseif(false){
	echo "false";
} else {
	echo "Neither true nor false";
}