<?php
trait _ConnectSqlServerDatabaseToTrait {
	public function _helpMeConnectSqlServerDatabases() {
		$SQLServerdatabaseConnectionString = '';
	}
}

interface _ConnectSqlServerDatabaseToModel {
	public function _youHaveToConnectSQLServerDatabase();
}

enum DatabasesTypesConnectingToServer {
	case _SQL;
	case _NoSQL;
	case _Graph;
	case Key_Value;
}