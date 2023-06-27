<?php
trait ConnectSqlServerDatabaseToTrait {
	public function helpMeConnectSqlServerDatabases() {
		$SQLServerdatabaseConnectionString = '';
	}
}

interface ConnectSqlServerDatabaseToModel {
	public function youHaveToConnectSQLServerDatabase();
}

enum DatabasesTypesConnectingToServer {
	case SQL;
	case NoSQL;
	case Graph;
	case Key_Value;
}