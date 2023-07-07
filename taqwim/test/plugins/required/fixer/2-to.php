<?php
/* taqwim "docblock/required": {exclude: ["function"]} */
/**
 * @var 
 */
const API_KEY = "IOPIQ345POL;2'3L4";
/**
 * @var 
 */
const API_URL = "http://api.example.com";
/**
 * @var 
 */
const API_VERSION = "1.0.0";
/**
 * @var 
 */
const API_TIMEOUT = 30;


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


