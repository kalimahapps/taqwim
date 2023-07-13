<?php

/**
 * Manage and handle database connections.
 */
class DatabaseConnect {
	
	/**
	 * Connect to the database.
	 *
	 * @param string $host Hostname of the database server
	 * @param string $username Username to connect with
	 * @param string $password Password to connect with
	 * @param string $database Database to connect to
	 * @return bool True on success, false on failure
	 */
	public function connect($host, $username, $password, $database) {
		$this->connection = mysql_connect($host, $username, $password);
		if (!$this->connection) {
			return false;
		}
		if (!mysql_select_db($database, $this->connection)) {
			return false;
		}
		return true;
	}
}