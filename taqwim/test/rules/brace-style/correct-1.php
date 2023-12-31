<?php

class Base
{
	protected $anonymous;
	public function __construct() 
	{
		$this->anonymous = new class extends ArrayObject
			{
				public function __construct()
				{
					parent::__construct(['a' => 1, 'b' => 2]);
				}
			};
	}
}

trait Message1
{
	public function msg1() 
	{
		echo "OOP is fun! ";
	}
}

class ClassName extends Directory implements \Countable
{
	private $items = [];
	public function __construct()
	{
	}
	
	public function count(): int
	{
		return 0;
	}
}

class A extends B
implements C
{
}

enum Suit 
{
    case Hearts;
    case Diamonds;
    case Clubs;
    case Spades;
}