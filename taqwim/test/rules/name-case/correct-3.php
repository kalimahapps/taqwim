<?php
class CheckMethodNameCase {
	public function camelCase() {
		echo "method name is in camelCase";
	}
	
	private function printLog() {
		echo "method name is in camelCase";
	}
}

interface CheckMethodNameCaseInterface {
	public function camelCase();
}

trait CheckMethodNameCaseTrait {
	public function camelCase() {
		echo "method name is in camelCase";
	}
}