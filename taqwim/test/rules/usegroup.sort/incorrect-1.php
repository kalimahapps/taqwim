<?php
namespace Taqwim\Test\Namespace;

use BadMethodCallException;
use Closure;
use SMTP\Mailer as SMTPMailer;
use Mailgun\Mailer as MailgunMailer;
use Illuminate\Contracts\Database\{
    Eloquent\Builder as BuilderContract,
    Query\Expression
};
use Illuminate\Contracts\Support\Arrayable;

use Exception;
use Illuminate\Database\Eloquent\{
    Concerns\QueriesRelationships,
    Relations\BelongsToMany,
    Relations\Relation
};
use Illuminate\Pagination\Paginator;
use ReflectionClass;
use Illuminate\Support\{
    Arr,
    Str,
    Traits\ForwardsCalls
};
use KalimahApps\Daleel\{
    Config,
    Containers\ContainerExtension,
    ViewBuilder,
    ImagePathExtension,
    InternalLinkExtension,
    CodeHighlighter\CodeHighlighterExtension
};
use Throwable;
use Illuminate\Database\{
    Concerns\BuildsQueries,
    Query\Builder as QueryBuilder,
    RecordsNotFoundException
};
use ReflectionMethod;
use Single\Traits\Test;

use const League\CommonMark\Util\{
    Xml,
    JSON,
    HTML
};
use const Vendor\Package\{
    CONSTANT_B,
    CONSTANT_C,
    CONSTANT_A
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