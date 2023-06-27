<?php
switch ($foo) {
    case 1:
    switch ($bar) {
            default:
            echo $string[1];
        }
    break;
}

function temp($foo, $bar) {
    switch ($foo) {
        case 1:
        switch ($bar) {
                default:
                return $foo;
            }
        break;
    }
}

switch ($foo) {
    case 1:
    switch ($bar) {
            default:
            if ($something) {
                    echo $string[1];
                } elseif ($else) {
                    switch ($else) {
                        default:
                    }
            }
        }
    break;
}

switch ($name) {
    case "1":
    case "2":
    case "3":
    return true;
}

switch ($name
) {
    case "1":
    case "2":
    case "3":
    return true;
}

switch ($id):
    case 1:
    case 2:
    break;
endswitch;

match ($food) {
    'apple' => 'This food is an apple',
    'orange' => 'This food is a orange',
    'cake' => 'This food is a cake',
};

match ($food
) {
    'apple' => 'This food is an apple',
    'orange' => 'This food is a orange',
    'cake' => 'This food is a cake',
};

match($month_name) {
    'jan' => 31,
    'feb' => is_leap_year($year) ? 29 : 28,
    'mar' => 31,
    'apr' => 30,
    'may' => 31,
    'jun' => 30,
    'jul' => 31,
    'aug' => 31,
    'sep' => 30,
    'oct' => 31,
    'nov' => 30,
    'dec' => 31,
    default => throw new InvalidArgumentException("Invalid month")
};