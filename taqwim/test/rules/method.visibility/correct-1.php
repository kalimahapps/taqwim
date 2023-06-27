<?php
class Database {
	public function getDatabaseStatus(){
		echo "connected to database";
	}
	
	public function setDatabaseStatus($status){
		echo "Status is set";
	}
	
	private function getMaxConnections(){
		echo "Max connections is 10";
	}
	
	private function setMaxConnections($connections){
		echo "Max connections is set";
	}
}