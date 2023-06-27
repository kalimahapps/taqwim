<?php
/* taqwim "psr/line-limit": {code: 120} */
/*
 * The comment is 117 charchaters but does not produce a warning. It defaults to the value of code if not specified.
 */
function test($first_param, $second_param, $third_param, $fourth_param, $fifth_param, $sixth_param) {
	echo "exceeds line limit";
}