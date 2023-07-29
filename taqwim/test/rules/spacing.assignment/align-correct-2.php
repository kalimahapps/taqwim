<?php
/* taqwim psr/spacing.assignment: {"align": true} */
foreach ($files as $file) {
    $saves[$file]              = array();
    $contents                  = stripslashes(file_get_contents($file));
    list($id, $time, $content) = explode("\n", $contents);
    $saves[$file]['id']        = $id;
    $var                     >>= $a;
    
    $var ??= $a;
}

if($test === true){
    $object->property         = $a;
    $object->another_property = $b;
    $a                        = $object->call_function();
}

$array[0]                     = $a;
$array[1]['property']         = $b;
$array[2]['another_property'] = $c;
$array[3]['another_property'] = $d;

$object->property                          = $a;
$object->another_property                  = $b;
$object->another_property                  = $c;
$object->another_property->nested_property = $d;

$loggerResult = $util->setLogger(new class {
    public function log($msg)
    {
        $a      = $msg;
        $foobar = $msg;
        $foo    = function() {
            $a            = $msg;
            $foobar       = $msg;
            $loggerResult = $util->setLogger(new class {
                public function log($msg)
                {
                    $a      = $msg;
                    $foobar = $msg;
                    $foo    = function() {
                        foo(function() {
                            foo(function() {
                                echo 'hi';
                            });
                            $a      = $msg;
                            $foobar = $msg;

                            $foo = function() {
                                $foo    = 1;
                                $barbar = 2;
                            };
                            $barbar = function() {
                                $foo    = 1;
                                $barbar = 2;
                            };
                        });
                        $a      = $msg;
                        $foobar = $msg;
                    };
                    $bar = $msg;
                }

                public function log2($msg)
                {
                    $a      = $msg;
                    $foobar = $msg;
                    $foo    = function() {
                        foo(function() {
                            foo(function() {
                                echo 'hi';
                            });
                            $a      = $msg;
                            $foobar = $msg;

                            $foo = function() {

                                $foo    = 1;
                                $barbar = 2;
                            };
                            $barbar = function() {
                                $foo    = 1;
                                $barbar = 2;
                            };
                        });
                        $a      = $msg;
                        $foobar = $msg;
                    };
                    $bar = $msg;
                }
            });
            $foo = 5;
        };
        $bar = $msg;
    }
});

$with_parenthesis       = ($object?->property);
$test                   = $object?->property;
$without_nullsafe       = $object->property;
$with_multiple_nullsafe = $object?->call()?->property2;