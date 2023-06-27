<?php

class ConnectDatabaseToControllerUsingSQLServer {
	private $SQLServerdatabaseConnectionString = '';
	
	public function connectSQLServerDatabaseWithThisFunction() {
		$this->SQLServerdatabaseConnectionString = '';
	}
}

interface ConnectSqlServerDatabaseToModel {
	public function youHaveToConnectSQLServerDatabase();
}

trait ConnectSqlServerDatabaseToTrait {
	public function helpMeConnectSqlServerDatabases() {
		$SQLServerdatabaseConnectionString = '';
	}
}

enum DatabasesTypesConnectingToServer {
	case SQL;
	case NoSQL;
	case Graph;
	case Key_Value;
}