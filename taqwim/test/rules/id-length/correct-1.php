<?php

class ConnectDatabaseToController {
	public function connectSQLDatabase() {
		$databaseConnectionString = 1;
	}
}

interface ConnectDatabaseToModel {
	public function connectSQLDatabase();
}

trait ConnectDatabaseToTrait {
	public function connectSQLDatabase() {
		$databaseConnectionString = 1;
	}
}

enum Databases {
	case SQL;
	case NoSQL;
	case Graph;
	case Key_Value;
}