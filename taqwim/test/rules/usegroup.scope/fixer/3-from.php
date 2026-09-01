<?php
namespace Taqwim\Test\Namespace;

use Illuminate\Database\Concerns;
use Illuminate\Database\Concerns\BuildsQueries;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Database\RecordsNotFoundException;
use KalimahApps\Daleel;
use KalimahApps\Daleel\CodeHighlighter\CodeHighlighterExtension;
use KalimahApps\Daleel\Config;
use KalimahApps\Daleel\ViewBuilder;
use Single\Traits\Test as AliasedTest;
use Single\Traits\Test\Nested;
use const Vendor\Package\Group;
use const Vendor\Package\Group\CONSTANT_A;
use const Vendor\Package\Group\CONSTANT_B;
use function Vendor\Package\Group\functionA;
use function Vendor\Package\Group\functionB;
