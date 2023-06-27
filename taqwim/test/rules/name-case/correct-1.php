<?php

class PascalCase {
	
	private $max_connections = 1;
	public $min_requests = 1;
	
	public function camelCase() {
		$snake_case = 1;
	}
}

interface PascalCaseInterface {
	public function camelCase();
}

trait PascalCaseTrait {
	public function camelCase() {
		$snake_case = 1;
	}
}

enum Seasons {
	case Spring;
	case Summer;
	case Autumn;
	case Winter;
}