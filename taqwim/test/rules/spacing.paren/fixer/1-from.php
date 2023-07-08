<?php
if    (     $expr1    )      {
    // if body
}elseif     (        $expr2) {
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

if ( call_function( $id ) || ! in_array( call_another( $id ), array( 'first', 'second' ))) {
	return false;
}

while (  $expr  ) {
    // structure body
}

switch (    $expr  ) {
    case 0:
        echo 'First case, with a break';
        break;
    default:
        echo 'Default case';
        break;
}

do {
    // structure body;
} while (   $expr   );

while (   $expr ) {
    // structure body
}

for (    $i = 0; $i < 10; $i++   ) {
    // for body
}

foreach (   $iterable as $key => $value   )          {
    // foreach body
}

foreach (
    $iterable as $key => $value          ) {
    // foreach body
}

try {
    // try body
} catch   (FirstThrowableType $e            )  		{
    // catch body
} catch    (    OtherThrowableType | AnotherThrowableType $e) {
    // catch body
} finally {
    // finally body
}

try {
    // try body
} catch   (FirstThrowableType $e   )  {
    // catch body
}

try {
    // try body
} catch   
(FirstThrowableType $e   )  {
    // catch body
} 
catch    (    OtherThrowableType | AnotherThrowableType $e) {
    // catch body
} finally {
    // finally body
}


do {
    // structure body;
} 
while (   $expr);

do {
    // structure body;
} 

while ($expr    );

do {
    // structure body;
} 

while
(
    $expr ||
    $expr2 ||
    $expr3
    );