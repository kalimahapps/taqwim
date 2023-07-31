<?php

function inverse($x)
{
	if (!$x) {
		throw new Exception('Division by zero.');
	}
	return 1/$x;
}

function connect(
	$server,
	$username,
	$password,
	$port,
	$database,
	$socket = array()
) {
	// Connect
}

function login(
	$username,
	$password,
) :boolean {
	// Connect
}