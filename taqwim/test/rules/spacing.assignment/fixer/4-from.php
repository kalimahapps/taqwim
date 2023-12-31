<?php
/* taqwim psr/spacing.assignment: {"align": true} */
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

$associative_array['foo'] = 'qux';
$associative_array['baz'] = 'bar';
$string_array[0] = 'qux';

$access_array = $associative_array['foo'];

class Test extends Testing {
	function construct($info)
	{
		$this->data['test'] = $info['test'];
		$this->data['foo'] = $info['foo'];
		$this->data['bar'] = $info['bar'];
		$this->data['baz']['nested'] = $test;
		$this->data['baz']['nested'] = $info['baz']['nested'];
		$this->data['baz']['nested'][] = $info['baz']['nested']['foo'];
		
		parent::__construct(['a' => 1, 'b' => 2]);
	}
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

$with_parenthesis = ($object?->property);
$test = $object?->property;
$without_nullsafe = $object->property;
$with_multiple_nullsafe = $object?->call()?->property2;