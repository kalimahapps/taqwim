<?php

class ReturnType {}

class ReturnTypeVariations {
    public function functionName (int $arg1, $arg2): string {
        return 'foo';
    }
	
	public function secondFunction() {
        return 'foo';
    }
    
    function functionWithMultipleTypes(int $arg1, $arg2): int {
        return 'foo';
    }

    public function anotherFunction(
        string $foo,
        string $bar,
        int $baz
    ): string {
        return 'foo';
    }
}

new class {
    public function functionName (int $arg1, $arg2): string {
        return 'foo';
    }
};

trait TraitName {
    public function functionName (int $arg1, $arg2): string {
        return 'foo';
    }
    
    public function secondFunction() {
        return 'foo';
    }
}

interface InterfaceName {
    public function functionName (int $arg1, $arg2): string;
}

enum Seasons {
    case Winter;
    case Spring;
    case Summer;
    case Autumn;
}