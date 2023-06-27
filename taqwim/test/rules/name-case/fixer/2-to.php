<?php
/* taqwim "psr/name-case": {property: "pascal"} */
class DatabaseClass {
	private $MaxConnections = 1;
	public $MinRequests = 1;
	
	public function camelCase() {
		$this->MaxConnections = 1;
		$this->MinRequests = 1;
	}
}
