<?php
class Logger {
	public function log($msg) {
		echo $msg;
	} // End of log method
} // End of logger class

function callLogger () {
	$logger = new Logger();
	$logger->log("Hello World");
} echo "End of file";