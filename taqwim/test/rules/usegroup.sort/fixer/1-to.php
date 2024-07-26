<?php
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
use Mailgun\Mailer as MailgunMailer;
use ReflectionClass;
use ReflectionMethod;
use Single\Traits\Test;
use SMTP\Mailer as SMTPMailer;
use Throwable;
use const Another\Vendor\CONSTANT_D;
use const League\CommonMark\Util\{
HTML,
JSON,
Xml
};
use const Vendor\Package\{
CONSTANT_A,
CONSTANT_B,
CONSTANT_C
};
use function Another\Vendor\functionD;
use function League\CommonMark\Util\{
HTML,
JSON,
Xml
};
use function Vendor\Package\{
functionA,
functionB,
functionC
};