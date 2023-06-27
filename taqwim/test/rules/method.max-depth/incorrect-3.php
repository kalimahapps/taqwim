<?php

function nestedFunction() {
	if ($condition) {
		echo 'hi';
		switch ($condition){
			case '1':
				if ($condition === '1') {
					if ($cond) {
						switch ($cond) {
							case '1':
								if ($cond === '1') {
									foreach ($conds as $cond) {
										if ($cond === 'hi') {
											echo 'hi';
										}
									}
								}
							break;
						}
					}
				}
			break;
		}
	}
}
