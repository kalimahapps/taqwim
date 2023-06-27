<?php
function complexityTenWithNestedTernaries() {
	$value1 = true ? $value1A : false ? $value1B : $value1C;

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
