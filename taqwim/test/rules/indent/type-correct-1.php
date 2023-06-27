<?php
/* taqwim "psr/indent" :{ type: "tab", length: 1 } */
class Test {
	public function close()
	{
		if (TRUE) {
				if (TRUE) {
				} else if (FALSE) {
					foreach ($tokens as $token) {
						switch ($token) {
							case '1':
							case '2':
								if (true) {
									if (false) {
										if (false) {
											if (false) {
												echo 'hello';
											}
										}
									}
								}
							break;
							case '5':
							break;
						}
						do {
							while (true) {
								foreach ($tokens as $token) {
									for ($i = 0; $i < $token; $i++) {
										echo 'hello';
									}
								}
							}
						} while (true);
					}
				}
		}
	}
}