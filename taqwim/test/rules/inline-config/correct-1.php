<?php
class A {
	// This comment will be ignored by this rule because it is not starting with taqwim
	private $b;
	public $c;
	
	/**
	 * Constructor.
	 *
	 * @param string $b
	 * @param string $c
	 */
	/* taqwim "taqwim/cyclomatic-complexity" : {max: 20} */
	public function __construct($b, $c) {
		$this->b = $b;
		$this->c = $c;
	}
}