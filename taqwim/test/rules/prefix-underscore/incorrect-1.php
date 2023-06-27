<?php
class __Database {
	private $_max_connections = 1;
	public $min_requests = 1;
	
	public function connect($_name) {
		echo "connected to $_name";
	}
	
	private function _disconnect($name) {
		echo "disconnected from $name";
	}
	
	public function _getConnections() {
		return $this->_max_connections;
	}
	
	public function setConnections($_connections) {
		$this->_max_connections = $_connections;
	}
}