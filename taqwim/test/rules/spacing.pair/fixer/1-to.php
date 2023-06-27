<?php
$var = array(1, 2, 3);
$var = array(
    1,
    2,
    3,
);

$var = array(
    "first_element" => "bar",
    2,
    "second" => "qux",
    3,
    "last_element_of_the_array",
);

$var = array(1 => 'one', 2 => 'two', 3 => 'three');

$var = array(
    1 => 'one',
    2 => 'two',
    3 => 'three',
);

$var = array(
    1 => 'one',
    2 => 'two',
    /* three */ 3 => 'three',
);

$fruit = array('apple' => array(
        'green',
        'red',
    ),
    'orange' => array(
        'orange',
    ),
    'banana' => array(
        'yellow',
    ),
);


$countries = array(
    'Japan' => array(
        'population' => 125961625,
        'capital' => 'Tokyo',
        'details' => array(
            'languages' => array('Japanese'),
            'original_name' => '日本',
        ),
    ),
    'India' => array(
        'population' => 1393409038,
        'capital' => 'New Delhi',
        'details' => array(
            'languages' => array('Hindi', 'English'),
            'original_name' => 'भारत',
        ),
    ),
    'South Korea' => array(
        'population' => 51780579,
        'capital' 
        => 'Seoul',
        'details' => array(
            'languages' => array('Korean'),
            'original_name' => '대한민국',
        ),
    ),
    'Thailand' => array(
        'population' => 69428524,
        'capital' => 'Bangkok',
        'details' => array(
            'languages' => array('Thai'),
            'original_name' => 'ประเทศไทย',
        ),
    ),
);

array(
    'apple' => array('green' => 'green apple',
        'red' => 'red apple',
    ), 'orange' => array(
        'big' =>
        'big orange',
        'small' => 'small orange',
        'outher' => array(
            'yellow' => 'yellow orange', 'green' => 'green orange',
        ),
        'more'
        => array('test', 'another', 5, 'more'),
    ),
    'banana' => array('yellow' => 'yellow banana',
        'green' => 'green banana',
    ),
    'plum' => array(
        'purple' => 'purple plum', 'green' => 'green plum',
    ),
);