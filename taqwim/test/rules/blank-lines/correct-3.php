<?php
try {
	$a = 1;
	$b = 2;
	$c = 3;
} catch (Exception $e) {
	// Test
	echo "Index: $i, Second Index: $j";
} catch (Exception $e) {
	// Test
	echo "Index: $i, Second Index: $j";
} finally {
	// Test
	echo "Index: $i, Second Index: $j";
}

if ($a) {
	// Test
	echo "Index: $i, Second Index: $j";
} elseif ($b) {
	// Test
	echo "Index: $i, Second Index: $j";
} else {
	// Test
	echo "Index: $i, Second Index: $j";
}

// Block padding is not applied to if/elseif/else statements
// due to parser limitations
if($a):
	// Test
	echo "Index: $i, Second Index: $j";

elseif($b) :
	// Test
	echo "First elseif condition";
elseif($b) :
	// Test
	echo "Second elseif condition";
else :

	// Test
	echo "Index: $i, Second Index: $j";
endif;