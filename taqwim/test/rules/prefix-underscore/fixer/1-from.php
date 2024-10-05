<?php
class Database {
	private $max_connections = 1;
	public $min_requests = 1;

	function __construct() {
		$this->_connect();
	}

	function __invoke()
	{
		$this->_connect();
	}

	function __destruct() {
		$this->_disconnect();
	}

	private function _connect($name) {
		echo "connected to $_name";
	}

	private function _disconnect($name) {
		echo "disconnected from $name";
	}

	public function getConnections() {
		return $this->max_connections;
	}

	public function setConnections($connections) {
		$this->max_connections = $connections;
	}
}