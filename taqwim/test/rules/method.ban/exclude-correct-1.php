<?php
/* taqwim "taqwim/method.ban": { exclude: ['error_log', 'var_dump', 'debug_backtrace']} */
if (!Ora_Logon($username, $password)) {
    error_log("Oracle database not available!", 0);
}

// Notify administrator by email if we run out of FOO
if (!($foo = allocate_new_foo())) {
    error_log(
        "Big trouble, we're all out of FOOs!",
        1,
        "operator@example.com"
    );
}

var_dump($_COOKIE);
var_dump($_GET, $_POST);

var_export($_COOKIE);
var_export($_GET, true);

print_r($_COOKIE);
print_r($_GET, true);

trigger_error("Value must be 1 or below", E_USER_WARNING);
trigger_error("Cannot divide by zero", E_USER_ERROR);

set_error_handler("customError");
set_error_handler("customError", E_USER_WARNING);
set_error_handler("customError", E_USER_WARNING | E_USER_NOTICE);

debug_backtrace();
var_dump(debug_backtrace());
debug_backtrace(DEBUG_BACKTRACE_PROVIDE_OBJECT, 2);
debug_backtrace(DEBUG_BACKTRACE_PROVIDE_OBJECT | DEBUG_BACKTRACE_IGNORE_ARGS, 2);

debug_print_backtrace();
debug_print_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS);
debug_print_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 2);