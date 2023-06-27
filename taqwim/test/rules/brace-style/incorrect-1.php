<?php
function inverse($x) {
	if (!$x) {
		throw new Exception('Division by zero.');
	}
	return 1/$x;
}

function connect(
	$server,
	$username,
	$password,
	$port,
	$database,
	$socket ) {
	// Connect
}

if (true) {
	echo "True"; }

// if elseif else
if (true) 
{
echo "True";} 
 elseif (false) {
	echo "False";
}  elseif
 (true) {	echo "middle test";
} else {
	echo "nested if"; }

try 
{
	echo inverse(0) . "\n";
} 
catch (ExceptionType1 $e) {
	echo inverse(5) . "\n";
} catch (ExceptionType2 $e) {
	error_log($e->getMessage());
}
finally {
echo "Final Step";
}

do {
	echo "The number is: $x <br>";
	$x++;
}
while (
	$x <= 5);