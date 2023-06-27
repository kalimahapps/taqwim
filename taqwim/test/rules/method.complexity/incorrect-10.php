<?php
function complexityElevenWithNullCoalescence() {
	$value1 = $value1A ?? $value1B;
	$value2 = $value2A ?? $value2B;
	$value3 = $value3A ?? $value3B;

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
