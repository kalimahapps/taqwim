<?php
/* taqwim "taqwim/array.syntax" : {type: "short"} */
$var = [1,2,3];
$var = [
    1,
    2,
    3
];
$var = [
    1,
    2,
    /* three */ 3,
];
$var = [
1,
        2,
    /* three */ 3,
 ];

$var = [
    1 => 'one',
    2 => 'two',
    3 => 'three'
];

$var = [
    1 => 'one',
    2 => 'two',
    /* three */ 3 => 'three',
];

$var = [
1 => 'one',
        2 => 'two',
    /* three */ 3 => 'three',
    ];

$test = [
    [
        'foo' => true,
    ],
    'foo' => true,
    'bar' => false,
];

$var = [
    'one' => function() {
        $foo = [1,2,3];
        $bar = [
            1,
            2,
            3];
    },
    'two' => 2,
];

return [
    [
        'foo' => true,
    ]
];


$var = [
1 => 'one',
        2 => 'two',
    /* three */ 3 => 'three',
    ];