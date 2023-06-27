<?php
$info = array(  'coffee','brown'   ,     'caffeine');
list($drink,     ,,$power) = $info;
list(    ,    , $tea) = $hot_drinks;
list($ice, 
 , $cold) = $other;

$foo = array (
	'apple' => array ( 		'green' => 'green apple',
		'red' => 'red apple',
	),'orange' => array  (
		'big' => 'big orange'   ,
		'small' => 'small orange'   ,
		'outher' => array  (
			'yellow' => 'yellow orange',			'green' => 'green orange',
		),
		'more' => array    (   'test', 'another', 5, 'more'   )
	),'banana' => array( 		'yellow' => 'yellow banana',
		'green' => 'green banana',
	),'plum' => array   (
		'purple' => 'purple plum','green' => 'green plum',
	)
);