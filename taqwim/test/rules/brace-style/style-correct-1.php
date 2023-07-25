<?php
/* taqwim psr/brace-style: {style: "1tbs"} */

class Testing {
	public function test() {
		if (true) {
			echo "Hello World";
		} else {
			echo "Hello World";
		}
	}
	
	private function multipleParameters($parameter1, $parameter2, $parameter3) {
		echo "Hello World";
	}
	
	private function multipleParamsOverMultipleLines(
		$parameter1,
		$parameter2,
		$parameter3
	) {
		echo "Hello World";
	}
}