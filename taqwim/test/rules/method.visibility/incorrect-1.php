<?php
class Database {
	function getDatabaseStatus(){
		echo "connected to database";
	}
	
	function setDatabaseStatus($status){
		echo "Status is set";
	}
	
	function getMaxConnections(){
		echo "Max connections is 10";
	}
	
	function setMaxConnections($connections){
		echo "Max connections is set";
	}
}