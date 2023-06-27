<?php
/* taqwim "psr/prefix-underscore" : {exclude: ['property', 'method']} */
class Database {
	private $_max_connections = 1;
	public $min_requests = 1;
	
	public function connect($name) {
		echo "connected to $name";
	}
	
	private function _disconnect($name) {
		echo "disconnected from $name";
	}
	
	public function _getConnections() {
		return $this->_max_connections;
	}
	
	public function setConnections($connections) {
		$this->_max_connections = $connections;
	}
}