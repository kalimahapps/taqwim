<?php
if ($expr1) {
    // if body
}elseif ($expr2) {
    // elseif body
} else {
    // else body;
}

if (         
    $expr1
    && $expr2
       ) {
    // if body
} elseif (
    $expr3
    && $expr4
    ) {
    // elseif body
}

switch ($expr) {
    case 0:
        echo 'First case, with a break';
        break;
    default:
        echo 'Default case';
        break;
}