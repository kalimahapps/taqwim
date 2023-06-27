<?php
/* taqwim psr/spacing.assignment: {"align": true} */
$var1=$a + $b;
$var11= $a / $b;
$var24= $a - $b;
$var89 = $a * $b;
$var8= $a % $b;
$var777 = $a ** $b;
$var568=$a . $b;
$var7899 =$a . $b . $c;
$var12121= $a / $b * $c + $d;

$var= $a + $b / $c * $d;

$var   =$a + 
    $b % $c * $d - $e;
$stringVar="hello world";
$var=
    "Value on new line";

$varOne= ($b = 4) + 5;
$varTwo -=   $a;
$varThreeFive+= $a;
$longVarName*= $a;
$varFour /=$a + $b;
$short   %= $a ** $b;
$foo  **= $a;
$var.=   $a;
$var   &= $a;

$var*=$a;
$var0115/= $a + $b;
$var00%=   $a ** $b;
$var4558**=  $a;
$var1478977    .=$a;
$var33&=$a;
$var778|=$a;
$var778   ^=$a;
$var<<=$a;
$var    >>=$a;
$var??= $a;

foreach ($files as $file) {
    $saves[$file]= array();
    $contents = stripslashes(file_get_contents($file));
    list($assetid, $time, $content) = explode("\n", $contents);
    $saves[$file]['assetid'] = $assetid;
    $var  >>= $a;
    
    $var ??= $a;
}

if($test === true){
    $object->property=$a;
    $object->another_property = $b;
    $a = $object->call_function();
}

$loggerResult= $util->setLogger(new class {
    public function log($msg)
    {
        $a = $msg;
        $foobar= $msg;
        $foo=function() {
            $a= $msg;
            $foobar=   $msg;
            $loggerResult= $util->setLogger(new class {
                public function log($msg)
                {
                    $a=   $msg;
                    $foobar= $msg;
                    $foo=function() {
                        foo(function() {
                            foo(function() {
                                echo 'hi';
                            });
                            $a=   $msg;
                            $foobar= $msg;

                            $foo= function() {
                                $foo=1;
                                $barbar= 2;
                            };
                            $barbar= function() {
                                $foo=1;
                                $barbar= 2;
                            };
                        });
                        $a=   $msg;
                        $foobar= $msg;
                    };
                    $bar= $msg;
                }

                public function log2($msg)
                {
                    $a=   $msg;
                    $foobar= $msg;
                    $foo=function() {
                        foo(function() {
                            foo(function() {
                                echo 'hi';
                            });
                            $a=   $msg;
                            $foobar= $msg;

                            $foo= function() {

                                $foo=1;
                                $barbar= 2;
                            };
                            $barbar= function() {
                                $foo=1;
                                $barbar= 2;
                            };
                        });
                        $a=   $msg;
                        $foobar= $msg;
                    };
                    $bar= $msg;
                }
            });
            $foo= 5;
        };
        $bar= $msg;
    }
});