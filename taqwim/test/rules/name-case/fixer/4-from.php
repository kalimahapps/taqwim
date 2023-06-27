<?php
class DatabaseClass {
	private $MaxConnections = 1;
	public $MinRequests = 1;
	
	public function camelCase() {
		$this->MinRequests = 1;
		$this->MaxConnections = 1;
	}
}
