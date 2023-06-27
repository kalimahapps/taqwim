<?php
class A {
	// taqwim-disable-nextline
	private $b;
	public $c;
	
	/**
	 * Constructor.
	 *
	 * @param string $b
	 * @param string $c
	 */

	/* taqwim "taqwim/cyclomatic-complexity:  max: 0} */
	public function __construct($b, $c) {
		$this->b = $b;
		$this->c = $c;
	}
}