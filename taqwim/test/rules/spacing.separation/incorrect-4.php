<?php
declare(encoding='ISO-8859-1')    
  ;
declare(ticks=1)   ;


namespace foo\bar\foo   ;
use My\Full\Classname as Another ;
use My\Full\Classname1  ,My\Full\NSname as second  ;
use My\Full\Classname2 ;

namespace foo\bar\foo    ;

// exit program normally
exit;
exit();
exit(0)    ;

//exit with an error code
exit(1);
exit(0376); //octal

unset($foo1,$foo2 , $foo3) ;
unset($foo1 ,
$foo2 ,$foo3) ;

function gen_one_to_three() {
    for ($i = 1; $i <= 3; $i++) {
        yield $i   ;
    }
}

function Sum() {
    global $a,$b ;
    $b = $a + $b;
}

class User {
    public int $id,$identifier  ;
    public ?string $name  ;
    
    use A ,B {
        B::smallTalk insteadof A;
        A::bigTalk insteadof B;
        B::bigTalk as talk;
    }
    
    use reflectionReturnInfo  , anotherTrait   ;
    
    
    public function __construct(int $id ,?string $name) {
       
        $this->id = $id ;
        $this->name = $name ;
    }
}

new User(1,'John Doe');
new User($id ,new User(1  ,'John Doe'));