<?php
switch ($i) {
    case 0:
        echo "i equals 0"; 
        
        break;
    case 1:
        echo "i equals 1";
        break;
    case 2:        echo "i equals 2";
        break;
  default:
    echo "Default statement"; break;
}

foreach ($arr as $key => $value) {
    if (!($key % 2)) { // skip even members
        continue;
    }
    do_something_odd($value);
}

$i = 0;
while ($i++ < 5) {
    echo "Outer<br />";
    while (1) {
        echo "Middle<br />";
        while (1) {
            echo "Inner<br />";
            continue 3;
        }
        echo "This never gets output.<br />";
    }
    echo "Neither does this.<br />";
}

for($i=0, $j=50; $i<100; $i++) {
  while($j--) {
    if($j==17) goto end;
  }  
}

for($i, $j; $i>50; $i++){
    echo $i;
}

for($i; $i>50; $i--){
    echo $i;
}

for(
    $i  = 0;
    $i>50; $i--):
    echo $i;
endfor;

for(;;$i++){
    echo $l;
}


goto a;
echo 'Foo';
 
a:
echo 'Bar';

echo "i = $i";
end:
echo 'j hit 17';