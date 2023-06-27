<?php
function complexityElevenWithNestedTernaries() {
	$value1 = ( empty( $condition1 ) ) ? $value1A : $value1B;
	$value2 = true ? $value2A : false ? $value2B : $value2C;

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

