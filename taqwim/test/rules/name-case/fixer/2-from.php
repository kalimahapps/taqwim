<?php
/* taqwim "psr/name-case": {property: "pascal"} */
class DatabaseClass {
	private $max_connections = 1;
	public $min_requests = 1;
	
	public function camelCase() {
		$this->max_connections = 1;
		$this->min_requests = 1;
	}
}
