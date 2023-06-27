<?php
class DatabaseClass {
	private $max_connections = 1;
	public $min_requests = 1;
	
	public function camelCase() {
		$this->min_requests = 1;
		$this->max_connections = 1;
	}
}
