<?php
function complexityElevenWithNullCoalescenceAssignment() {
	$value1 ??= $default1;
	$value2 ??= $default2;
	$value3 ??= $default3;

	switch ( $condition ) {
		case '1':
			if ( $condition ) {
			} elseif ( $cond ) {
			}
			break;
		case '2':
			while ( $cond ) {
				echo 'hi';
			}
			break;
		case '3':
			break;
		default:
			break;
	}
}
