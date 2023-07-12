<?php
/* taqwim "taqwim/method.ban" : {
    include: [{
        name: "allocate_new_foo",
        message: "Notify administrator by email if we run out of FOO",
    }]
} */
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
