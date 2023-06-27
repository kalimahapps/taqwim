<?php
trait TraitWithFewMembers {
	private $a;
	private $b;
	private $c;
	private $d;
	private $e;
	private $f;
	
	public function getA() {
		return $this->a;
	}
	
	public function getB() {
		return $this->b;
	}
	
	public function getC() {
		return $this->c;
	}
}