<?php
class Database {
	private $max_connections = 10;
	private $connections = 0;
	    
	/**
	 * Connect to the database.
	 *
	 * @return bool True on success, false on failure
	 */
	public function connect() {    
		if ($this->connections < $this->max_connections) {		
			$this->connections++;
			return true;    
		}
		return false;
	}      
}