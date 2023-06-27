<?php
/* taqwim "psr/prefix-underscore" : {exclude: ['property']} */
class Database {
	private $_max_connections = 1;
	public $min_requests = 1;
	
	function __construct() {
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
		return $this->_max_connections;
	}
	
	public function setConnections($connections) {
		$this->_max_connections = $connections;
	}
}