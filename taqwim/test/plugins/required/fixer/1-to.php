<?php
/**
 * 
 */
class DatabaseConnect {
/**
 * @var 
 */
	private $min_password_length = 8;
/**
 * @var 
 */
	private $max_connections = 10;
/**
 * @var 
 */
	private $connection_timeout = 30;
/**
 * @var 
 */
	private $connection;
  
/**
 * 
 * 
 * @param $host 
 * @param $username 
 * @param $password 
 * @param $database 
 * @return 
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

/**
 * 
 * 
 * @param string $message 
 * @param int $level 
 * @param $echo 
 * @return bool 
 */
	private function log(string $message, int $level = 0, $echo = false): bool {
		echo $message;
	}
}