<?php
/* taqwim-disable docblock/required */
/* taqwim "psr/indent" :{type: "tabs", length: 1 } */
class Base
{
	protected $anonymous;
	public function __construct()
	{
		$this->anonymous = new class extends ArrayObject
			{
				public function __construct()
				{
					/* taqwim-disable taqwim/array.syntax */
					parent::__construct(['a' => 1, 'b' => 2]);
					/* taqwim-enable taqwim/array.syntax */
				}
			};
	}
}

/* taqwim-disable
psr/trailing-space,
psr/one-declaration-per-file,
psr/spacing.paren
*/
trait Message1
{
	public function msg1 ()
	{
		echo "OOP is fun! ";
	}
}
/* taqwim-enable */

/* taqwim "taqwim/id-length": {min: 1} */
for ($i; $i < 10; $i++) {
	/* taqwim-disable-next-line */
	for($j; $j < 10; $j++) {
		echo "Index: $i, Second Index: $j";
	}
}

/* taqwim-disable */
IF(true){
	echo "true";
} ELSEIF(false){
	echo "false";
} ELSE {
	echo "Neither true nor false";
}

/* taqwim "taqwim/method.break-parameters": "warn" */
function logInfo($first, $second, $third, $fourth, $fifth, $sixth, $seventh) {
	echo $message;
}