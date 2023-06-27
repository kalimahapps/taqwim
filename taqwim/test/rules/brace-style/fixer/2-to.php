<?php
/* taqwim "psr/brace-style": {style: "1tbs"} */

class Base  {
	protected $anonymous;
	public function __construct()  {
		$this->anonymous = new class extends ArrayObject
			{
				public function __construct() {
					parent::__construct(['a' => 1, 'b' => 2]);
				}
			};
	}
}

trait Message1  {
	public function msg1() 	 {
		echo "OOP is fun! ";
	}
}

class ClassName extends Directory implements \Countable  {
	private $items = [];
	public function __construct() {
	}
	
	public function count(): int  {
		return 0;
	}
}

class A extends B {
}

enum Suit {
    case Hearts;
    case Diamonds;
    case Clubs;
    case Spades;
}

if (true) {
	echo "True";
}

// if elseif else
if (true)  {

	echo "True";
} elseif (false) {

	echo "False";
} elseif (true) {

	echo "middle test";
} else {
	echo "nested if";
}



if (true)  {// inline comment

	echo "True";
} else {
	echo "one level data";
}

foreach ($array as $key => $value)  {// Foreach comment

	echo "True";
}

for($i = 0; $i < 10; $i++)  {

	echo "True";
}

function inverse($x)  {
	if (!$x)  {
	
		throw new Exception('Division by zero.');
	}
	return 1/$x;
}

do  {

	echo "The number is: $x <br>";
	$x++;
} while ($x <= 5);

try {
	echo inverse(5) . "\n";
} catch (Exception $e) {
	echo 'Caught exception: ',  $e->getMessage(), "\n";
} finally {
	echo "First finally.\n";
}

try {
	echo inverse(0) . "\n";
} catch (Exception $e) {
	echo 'Caught exception: ',  $e->getMessage(), "\n";
}


try {
	echo inverse(0) . "\n";
} catch (ExceptionType1 $e) {
	echo inverse(5) . "\n";
} catch (ExceptionType2 $e) {
	error_log($e->getMessage());
} finally {
echo "Final Step";
}