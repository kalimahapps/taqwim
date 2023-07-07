<?php
/**
 * @var string Key to use for API calls.
 */
const API_KEY = "IOPIQ345POL;2'3L4";

/**
 * @var string API URL.
 */
const API_URL = "http://api.example.com";

/**
 * @var string Used API version.
 */
const API_VERSION = "1.0.0";

/**
 * @var int  Timeout for API calls.
 */
const API_TIMEOUT = 30;


/**
 * Get data from API endpoint.
 * 
 * @param string $endpoint API endpoint
 * @return string Data from API
 */
function getData($endpoint){
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, API_URL . $endpoint);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_TIMEOUT, API_TIMEOUT);
	curl_setopt($ch, CURLOPT_HTTPHEADER, array(
		"X-API-KEY: " . API_KEY,
		"X-API-VERSION: " . API_VERSION
	));
	$data = curl_exec($ch);
	curl_close($ch);
	return $data;
}

/**
 * Disconnect from database.
 */
function disconnect(){
	echo "Disconnecting...";
}