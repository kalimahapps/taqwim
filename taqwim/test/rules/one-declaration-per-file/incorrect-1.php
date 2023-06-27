<?php

class Connect {
	public function __construct() {
		echo 'Connect';
	}
}

class Logger {
	public function __construct() {
		echo 'Logger';
	}
}

interface Connect {
	public function __construct();
}

function logError() {
	echo 'log';
}