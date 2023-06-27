<?php
/* taqwim "psr/line-limit": {comment: 120} */
/*
 * The comment is 104 charchaters but does not produce a warning. This is because comment is set to 120
 */
function test($first_param, $second_param, $third_param, $fourth_param) {
	echo "exceeds line limit";
}