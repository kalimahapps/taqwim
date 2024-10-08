<?php

/* taqwim "psr/name-case": {class: "snake"} */
class DatabaseClass {
	private $max_connections = 1;
	public $min_requests = 1;

	public function __construct() {
		$this->max_connections = 1;
		$this->min_requests = 1;
	}

	public function __invoke()
	{
		$this->max_connections = 1;
		$this->min_requests = 1;
	}

	public function camelCase() {
		$snake_case = 1;
	}
}

interface DatabaseInterface {
	public function camelCase();
}

trait DatabaseTrait {
	public function camelCase() {
		$snake_case = 1;
	}
}