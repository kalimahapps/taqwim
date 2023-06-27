<?php
function hello_world($hello) {
    echo "HELLO world";
}

$closure_with_args = function($arg1, $arg2) {
        // body
};

$closure_with_args = function($arg1, $arg2): ReturnType {
        // body
};

$closure_with_args_and_vars = function($arg1, $arg2)
    use ($var1, $var2) {
        // body
    };

$closure_with_args_vars_and_return = function($arg1, $arg2) use
    ($var1, $var2): bool {
        // body
    };
    
array_map(function($arg) {
    // body
}, $array);

array_walk($array, function($value, $key) use ($outer_value): bool {
    // body
});
