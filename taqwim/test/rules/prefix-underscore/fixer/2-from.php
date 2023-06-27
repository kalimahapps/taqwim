<?php
/* taqwim "psr/prefix-underscore" : {exclude: ['property']} */
class Database {
	private $_max_connections = 1;
	public $min_requests = 1;
	
	function __construct() {
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
		return $this->_max_connections;
	}
	
	public function setConnections($connections) {
		$this->_max_connections = $connections;
	}
}