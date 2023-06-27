<?php
while ($expr) {
    // structure body
}

while ($expr) {
    // structure body
}

do {
    echo "do while body";
} while ($expr);

for ($i = 0; $i < 10; $i++) {
    // for body
}

for ($i = 0; $i < 10; $i++) :
    // for short form
endfor;

foreach ($iterable as $key => $value) {
    // foreach body
}

foreach (
    $iterable as $key => $value) {
    // foreach body
}

foreach ($iterable as $key => $value) :
    // foreach short form
endforeach;

if ($expr1
) {
    // if body
} elseif ($expr2) {
    // elseif body
} else {
    // else body;
}

if (
    $expr1
    && $expr2
) {
    // if body
} elseif ($expr3 && $expr4) {
    // elseif body
} else {
    echo "else";
}

if($expr1):
    // if shortform
endif;