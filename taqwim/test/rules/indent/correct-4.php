<?php
$object
?->setBar($foo)
?->setFoo($bar);

$someObject?->someFunction("some", "parameter")
->someOtherFunc(23, 42)?->
someOtherFunc2($one, $two)

->someOtherFunc3(23, 42)
?->andAThirdFunction();

$object
?->setBar($foo)
?->setFoo($bar);

$someObject?->someFunction("some", "parameter")
->someOtherFunc(
    23,
    42
)?->someOtherFunc2($one, $two)

->someOtherFunc3(23, 42)
?->andAThirdFunction();

$someObject
->startSomething(paramName: $value)
->someOtherFunc(nameA: 23, nameB: 42)
->endSomething($value, name: $value)
->endEverything();

Route::get('/',	function () {
    return 'Hello World';
});

$closure = function () {
    return 'Hello World';
};

function multiplier($factor) {
    return function($number) use ($factor) {
        return $number * $factor;
    };
}

$squared = array_map(function($n) {
    return $n * $n;
}, $numbers);