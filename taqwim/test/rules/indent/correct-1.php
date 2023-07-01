<?php
class Test
{
    function __construct()
    {
        $this->hello();
    }

    function hello(

    )
    {
        echo 'hello';
    }

    function hello2()
    {
        if (TRUE) {
            echo 'hello';
        } else {
            echo 'bye';
        }

        while (TRUE) {
            echo 'hello'; 
        }

        do {
            echo 'hello';
        } while (TRUE);
    }

    function hello3()
    {
        switch ($hello) {
            case 'hello':
            break;
        }
    }

}


class Test2
{
    function __construct()
    {
        //    $this->open();
    }

    public function open()
    {
        if (TRUE) echo 'hello';
        foreach ($tokens as $token) echo $token;
    }

    /**
     * This is a comment 1.
     * This is a comment 2.
     * This is a comment 3.
     * This is a comment 4.
     */
    public function close()
    {
        if (TRUE) {
            if (TRUE) {
            } else if (FALSE) {
                foreach ($tokens as $token) {
                    switch ($token) {
                        case '1':
                        case '2':
                            if (true) {
                                if (false) {
                                    if (false) {
                                        if (false) {
                                            echo 'hello';
                                        }
                                    }
                                }
                            }
                        break;
                        case '5':
                        break;
                    }
                    do {
                        while (true) {
                            foreach ($tokens as $token) {
                                for ($i = 0; $i < $token; $i++) {
                                    echo 'hello';
                                }
                            }
                        }
                    } while (true);
                }
            }
        }
    }

    /*
    This is another c style comment 1.
    This is another c style comment 2.
    This is another c style comment 3.
    This is another c style comment 4.
    This is another c style comment 5.
    */

    /*
    *
    *
    *
    */

    /**
   */

    /*
    This comment has a newline in it.

    */
    public function read()
    {
        echo 'hello';

        $array = array(
            'this',
            'that' => array(
                'hello',
                'hello again' => array(
                    'hello',
                ),
            ),
        );
    }
}

abstract class Test3
{
    public function parse()
    {

        foreach ($t as $ndx => $token) {
            if (is_array($token)) {
                echo 'here';
            } else {
                $ts[] = array("token" => $token, "value" => '');

                $last = count($ts) - 1;

                switch ($token) {
                    case '(':

                        if ($last >= 3 &&
                            $ts[0]['token'] != T_CLASS &&
                            $ts[$last - 2]['token'] == T_OBJECT_OPERATOR &&
                            $ts[$last - 3]['token'] == T_VARIABLE ) {


                            if (true) {
                                echo 'hello';
                            }
                        }
                        array_push($braces, $token);
                    break;
                }
            }
        }
    }
}

$array = [
];
$another_array = array(
);