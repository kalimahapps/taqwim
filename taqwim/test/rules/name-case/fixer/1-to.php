<?php

/* taqwim "psr/name-case": {class: "snake"} */
class database_class {
	private $max_connections = 1;
	public $min_requests = 1;
	
	public function camelCase() {
		$snake_case = 1;
	}
}

interface database_interface {
	public function camelCase();
}

trait database_trait {
	public function camelCase() {
		$snake_case = 1;
	}
}