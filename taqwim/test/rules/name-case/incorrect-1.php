<?php

class className {
	
	private $maxConnections = 1;
	public $minRequests = 1;
	
	public function connect_database() {
		echo "connected";
	}
}

interface camelCaseInterface {
	public function get_database_type();
}

trait camelCaseTrait {
	public function log_database_connection() {
		echo "logged ...";
	}
}

enum allSeasons {
	case Spring;
	case Summer;
	case Autumn;
	case Winter;
}