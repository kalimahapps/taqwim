<?php
/* taqwim "taqwim/usegroup.scope": {state: "expand"} */
namespace Taqwim\Test\Namespace;

use BadMethodCallException;
use Closure;
use Exception;
use Illuminate\Contracts\Database\{
Eloquent\Builder as BuilderContract,
Query\Expression
};
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Database\{
Concerns\BuildsQueries,
Query\Builder as QueryBuilder,
RecordsNotFoundException
};
use Illuminate\Database\Eloquent\{
Concerns\QueriesRelationships,
Relations\BelongsToMany,
Relations\Relation
};
use Illuminate\Pagination\Paginator;
use Illuminate\Support\{
Arr,
Str,
Traits\ForwardsCalls
};
use KalimahApps\Daleel\{
CodeHighlighter\CodeHighlighterExtension,
Config,
Containers\ContainerExtension,
ImagePathExtension,
InternalLinkExtension,
ViewBuilder
};
use ReflectionClass;
use ReflectionMethod;
use Single\Traits\Test;
use Throwable;

use const League\CommonMark\Util\{
Xml,
JSON,
HTML
};
use const Vendor\Package\{
CONSTANT_A,
CONSTANT_B,
CONSTANT_C
};
use const Another\Vendor\CONSTANT_D;

use function League\CommonMark\Util\{
Xml,
JSON,
HTML
};
use function Vendor\Package\{
functionA,
functionB,
functionC
};
use function Another\Vendor\functionD;
