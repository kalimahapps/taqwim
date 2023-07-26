<?php
/* taqwim "psr/indent" :{ type: "tab", length: 1 } */
use Symfony\Component\Console\{
	Command\Command,
	Input\InputInterface,
	Input\InputOption,
	Output\OutputInterface,
	Logger\ConsoleLogger
};

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