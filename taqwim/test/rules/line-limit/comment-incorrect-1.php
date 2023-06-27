<?php
/* taqwim "psr/line-limit": {comment: 70} */
/*
 * The comment will produce a warning because it is 71 characters long ...
 */
function test($first_param, $second_param, $third_param, $fourth_param) {
	echo "exceeds line limit";
}