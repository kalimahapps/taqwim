<?php
$var = array(1,2,3);
$var = array(
    1,
    2,
    3
);
$var = array(
    1,
    2,
    /* three */ 3,
);
$var = array(
1,
        2,
    /* three */ 3,
 );

$var = array(
    1 => 'one',
    2 => 'two',
    3 => 'three'
);

$var = array(
    1 => 'one',
    2 => 'two',
    /* three */ 3 => 'three',
);

$var = array(
1 => 'one',
        2 => 'two',
    /* three */ 3 => 'three',
    );

$test = array(
    array(
        'foo' => true,
    ),
    'foo' => true,
    'bar' => false,
);

$var = array(
    'one' => function() {
        $foo = array(1,2,3);
        $bar = array(
            1,
            2,
            3);
    },
    'two' => 2,
);

return array(
    array(
        'foo' => true,
    )
);


$var = array(
1 => 'one',
        2 => 'two',
    /* three */ 3 => 'three',
    );