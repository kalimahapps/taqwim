<?php
class BlogData
{
    private Status $status;

    public function __construct(Status $status)
    {
        $this->status = $status;
    }

    public function getStatus(): Status
    {
        return $this->status;
    }
}

function count_and_iterate(Iterator $value)
{
    if (! ($value instanceof Countable)) {
        throw new TypeError('value must be Countable');
    }

    foreach ($value as $val) {
        echo $val;
    }

    count($value);
}

function redirect(string $uri)
{
    header('Location: ' . $uri);
    exit();
}

function redirect_to_login_page()
{
    redirect('/login');
    echo 'Hello'; // <- dead code
}

class Foo
{
    public const XX = "foo";
}

class Bar extends Foo
{
    public const XX = "bar"; // No error
}

$array_a = array('a' => 1);
$array_b = array('b' => 2);

$result = array_merge(array('a' => 0), $array_a, $array_b);