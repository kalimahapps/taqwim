<?php

function nestedFunction() {
	if ($condition) {
		echo 'hi';
		switch ($condition) {
			case '1':
				if ($condition === '1') {
					if ($cond) {
						foreach ($conds as $cond) {
							echo 'hi';
						}
					}
				}
			break;
		}
	}
}
