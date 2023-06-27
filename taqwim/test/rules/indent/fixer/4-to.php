<?php
/* taqwim "psr/indent" :{ type: "tab", length: 1 } */
switch ($foo) {
	case 1:
		switch ($bar) {
			default:
			echo $string[1];
		}
	break;
}

function temp($foo, $bar) {
	switch ($foo) {
		case 1:
			switch ($bar) {
				default:
				return $foo;
			}
		break;
	}
}

switch ($foo) {
	case 1:
		switch ($bar) {
			default:
				if ($something) {
					echo $string[1];
				} else if ($else) {
					switch ($else) {
						default:
					}
			}
		}
	break;
}

switch ($name) {
	case "1":
	case "2":
	case "3":
	return true;
}

switch ($name) {
	case "1":
	case "2":
	case "3":
	default :
	return true;
}

switch ($foo) {
	case 1:
		switch ($bar) {
			default:
				if ($something) {
					echo $string[1];
				} else if ($else) {
					switch ($else) {
						case 1:
							// Do something.
						break;
						default:
							// Do something.
						break;
					}
			}
		}
	break;
	case 2:
		// Do something;
	break;
}

switch ($httpResponseCode) {
	case 100:
	case 101:
	case 102:
	exit;
	default:
	exit;
}