<?php
match ($food) {    'apple' => 'This food is an apple',
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
    default => throw new InvalidArgumentException("Invalid month"),
};

enum Color {
    case Red;
    case Green;
    case Blue;
}

enum continents {
    case Asia;
    case Europe;
    case Africa;
    case NorthAmerica;
    case SouthAmerica;
    case Antarctica;
    case Australia;
}