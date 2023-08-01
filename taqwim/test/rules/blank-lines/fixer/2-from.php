<?php
for ($i; $i < 10; $i++) :

    /* taqwim-disable-next-line */
    for($j; $j < 10; $j++) {

        // Test
        echo "Index: $i, Second Index: $j";
    }
endfor;
/**
 * Switch statement
 */
switch ($i) {



    // Case 1
    case 1:

        // inner comment
        foreach($items as $item) {
            // inner comment
            echo $item;
        }

        echo "1";
        // Another foreach
        foreach($items as $item) {


            // inner comment
            echo $item;
        }
        break;
    // Case 2
    case 2:

        // inner comment
        if($i == 2) {
            // inner comment
            echo "2";
        }
        break;
    // Default case
    default:
        for($j; $j < 10; $j++) {


            // Test
            echo "Index: $i, Second Index: $j";

        }
        break;
}
/**
 * Docblock comment
 */
function foo() {

    /* Comment block */
    $a = 1;
    $b = 2;
    $c = 3;

}



function test(){
    echo "Hello";
    // Line comment
    echo "World";
}