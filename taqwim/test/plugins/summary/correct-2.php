<?php
/**
 * Get data from API endpoint.
 * 
 * @param string $endpoint API endpoint
 * @return string Data from API
 */
function get_data($endpoint){
	// Connect and return data
	return $data;
}

/**
 * Disconnect from database.
 */
function disconnect(){
	echo "Disconnecting...";
}

function no_docblock(){
	echo "This function will be ignored by this rule.";
}

/* This is a non docblock comment and will be ignored by this rule */
function non_docblock_comment(){
	echo "This function will be ignored by this rule.";
}

