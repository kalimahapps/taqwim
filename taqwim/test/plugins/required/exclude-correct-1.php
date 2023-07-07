<?php
/* taqwim "docblock/required": {exclude: ["property", "method"]} */
/**
 * Manage and handle database connections.
 */
class DatabaseConnect {
	private $min_password_length = 8;
	private $max_connections = 10;
	private $connection_timeout = 30;
	private $connection;

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