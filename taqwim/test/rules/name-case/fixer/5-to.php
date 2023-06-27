<?php
/* taqwim "psr/name-case": {property: "camel", method: "snake"} */
class DatabaseClass {
	private $maxConnections = 1;
	public $minRequests = 1;
	
	function __construct() {
		$this->set_database_connections();
	}
	
	public function set_database_connections() {
		$this->minRequests = 1;
		$this->maxConnections = 1;
	}
}