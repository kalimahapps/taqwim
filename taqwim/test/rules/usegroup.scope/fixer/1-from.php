<?php
namespace Taqwim\Test\Namespace;

use BadMethodCallException;
use Closure;
use Exception;
use Illuminate\Contracts\Database\Eloquent\Builder as BuilderContract;
use Illuminate\Contracts\Database\Query\Expression;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Database\Concerns\BuildsQueries;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Database\RecordsNotFoundException;
use Illuminate\Database\Eloquent\Concerns\QueriesRelationships;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Illuminate\Support\Traits\ForwardsCalls;
use KalimahApps\Daleel\CodeHighlighter\CodeHighlighterExtension;
use KalimahApps\Daleel\Config;
use KalimahApps\Daleel\Containers\ContainerExtension;
use KalimahApps\Daleel\ImagePathExtension;
use KalimahApps\Daleel\InternalLinkExtension;
use KalimahApps\Daleel\ViewBuilder;
use ReflectionClass;
use ReflectionMethod;
use Single\Traits\Test;
use Throwable;
use const League\CommonMark\Util\Xml;
use const League\CommonMark\Util\JSON;
use const League\CommonMark\Util\HTML;
use const Vendor\Package\CONSTANT_A;
use const Vendor\Package\CONSTANT_B;
use const Vendor\Package\CONSTANT_C;
use const Another\Vendor\CONSTANT_D;
use function League\CommonMark\Util\Xml;
use function League\CommonMark\Util\JSON;
use function League\CommonMark\Util\HTML;
use function Vendor\Package\functionA;
use function Vendor\Package\functionB;
use function Vendor\Package\functionC;
use function Another\Vendor\functionD;