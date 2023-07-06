<?php

$array_a = array('a' => 1);
$array_b = array('b' => 2);
$result = array('a' => 0, ...$array_a, ...$array_b);

function redirect(string $uri): never
{
    header('Location: ' . $uri);
    exit();
}

function redirect_to_login_page(): never
{
    redirect('/login');
    echo 'Hello'; // <- dead code detected by static analysis
}

function count_and_iterate(Iterator&Countable $value, string $test)
{
    foreach ($value as $val) {
        echo $val;
    }

    count($value);
}

function function_with_return_type($value, string $test): FirstType&SecondType
{
    foreach ($value as $val) {
        echo $val;
    }

    count($value);
}

readonly class BlogData
{
    public readonly Status $status;

   
    public function alwaysFalse(false $variable): false
    {
        echo "Function alwaysFalse() is called";
    }

    public function alwaysTrue(true $trueVar): true
    {
        echo "Function alwaysTrue() is called";
    }

    public function alwaysNull(null $nullVar): null
    {
        echo "Function alwaysNull() is called";
    }

    public function __construct(Status $status)
    {
        $this->status = $status;
    }

    private function countAndIterate($value, string $test): Iterator&Countable
    {
        foreach ($value as $val) {
            echo $val;
        }

        count($value);
    }
}

enum Status
{
    case Draft;
    case Published;
    case Archived;
}