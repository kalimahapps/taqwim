<?php
const LONG_SERVER_VARIABLE_INCLUDED_IN_FILE = '';
const ANOTHER_LONG_SERVER_VARIABLE_INCLUDED_IN_FILE = '';

function connectSqlServerDatabaseUsingThisFunction() {
	echo "Connecting to database...";
}

for($i; $i < 10; $i++) {
	for($j; $j < 10; $j++) {
		echo "Index: $i, Second Index: $j";
	}
}