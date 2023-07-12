<?php

$foo = $bar ? $baz : $qux ? $quux : $corge;
echo ($foo ? $bar : $baz) ? $qux : $quux;

// multilevel ternary
$foo = $bar ? $baz : $qux ? $quux : $corge ? $grault : $garply;
echo ($foo ? $bar : $baz) ? $qux : $quux ? $corge : $grault;