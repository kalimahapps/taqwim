<?php
/* taqwim "psr/name-case": {property: "camel", method: "snake"} */
class DatabaseClass {
	private $MaxConnections = 1;
	public $MinRequests = 1;
	
	function __construct() {
		$this->setDatabaseConnections();
	}
	
	public function setDatabaseConnections() {
		$this->MinRequests = 1;
		$this->MaxConnections = 1;
	}
}