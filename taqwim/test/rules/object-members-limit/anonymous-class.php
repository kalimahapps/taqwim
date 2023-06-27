<?php
/* taqwim "taqwim/object-members-limit": {max: 10 } */
$obj = new class {
	private $a;
	private $b;
	private $c;
	private $d;
	private $e;
	
	public function setA($a) {
		$this->a = $a;
	}
	
	public function setB($b) {
		$this->b = $b;
	}
	
	public function setC($c) {
		$this->c = $c;
	}
	
	public function setD($d) {
		$this->d = $d;
	}
	
	public function setE($e) {
		$this->e = $e;
	}
	
	public function getA() {
		return $this->a;
	}
}