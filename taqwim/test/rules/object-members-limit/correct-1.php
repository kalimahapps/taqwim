<?php
class ClassWithFewMembers {
	public $a;
	public $b;
	
	public function __construct() {
		$this->a = 1;
		$this->b = 2;
	}
	
	public function getA() {
		return $this->a;
	}
	
	public function getB() {
		return $this->b;
	}
	
	public function setA($a) {
		$this->a = $a;
	}
	
	public function setB($b) {
		$this->b = $b;
	}
}