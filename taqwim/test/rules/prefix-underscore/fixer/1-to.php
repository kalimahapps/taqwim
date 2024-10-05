<?php
class Database {
	private $max_connections = 1;
	public $min_requests = 1;

	function __construct() {
		$this->connect();
	}

	function __invoke()
	{
		$this->connect();
	}

	function __destruct() {
		$this->disconnect();
	}

	private function connect($name) {
		echo "connected to $name";
	}

	private function disconnect($name) {
		echo "disconnected from $name";
	}

	public function getConnections() {
		return $this->max_connections;
	}

	public function setConnections($connections) {
		$this->max_connections = $connections;
	}
}