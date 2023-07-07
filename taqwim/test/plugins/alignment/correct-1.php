<?php
/**
 * Log info.
 *
 * @param string $message Message to log
 * @return bool True on success, false on failure
 */
function log_info($message) {
	echo $message;
	return true;
}

/*
* Non-docblock comment will be ignored by this rule.
*/
function log_error($message) {
	echo $message;
	return true;
}

function function_with_no_docblock($message) {
	echo $message;
	return true;
}