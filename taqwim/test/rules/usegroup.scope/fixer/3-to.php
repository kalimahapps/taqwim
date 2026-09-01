<?php
namespace Taqwim\Test\Namespace;

use Illuminate\Database\Concerns;
use Illuminate\Database\{
Concerns\BuildsQueries,
Query\Builder as QueryBuilder,
RecordsNotFoundException
};
use KalimahApps\Daleel;
use KalimahApps\Daleel\{
CodeHighlighter\CodeHighlighterExtension,
Config,
ViewBuilder
};
use Single\Traits\Test as AliasedTest;
use Single\Traits\Test\Nested;

use const Vendor\Package\Group;
use const Vendor\Package\Group\{
CONSTANT_A,
CONSTANT_B
};

use function Vendor\Package\Group\{
functionA,
functionB
};

