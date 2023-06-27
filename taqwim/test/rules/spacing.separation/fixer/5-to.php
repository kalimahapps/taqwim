<?php
include "file4.php";
require "file5.php";
require_once dirname(__DIR__, 1) . 'file3.php';
include_once "file2.php";
require_once "file6.php";


$assign = 1;
$test = 5;
$string_var = "This is a test";

$multiline_string = "This is a test
of a multiline string
in PHP";


$new_string = $string_var;