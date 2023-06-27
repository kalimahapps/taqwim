<?php
rEQUIRE("test.php");
REQUIRE_ONCE("test.php");
INCLUDE_ONCE("test.php");
INclude("test.php");

class Base
{
	PROTECTED $anonymous;

	PUBLIC FUNCTION __construct(){
		$this->anonymous = new class extends ArrayObject
			{
				public function __construct(){
					parent::__construct(['a' => 1, 'b' => 2]);
				}
			};
	}
}