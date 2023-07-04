<?php
  #[ORM\Entity]
    #[ORM\Table(name: 'symfony_demo_tag')]
class Tag implements \JsonSerializable
{
#[ORM\Id]
  #[ORM\GeneratedValue]
    private ?int $id = null;

  #[ORM\Column(type: Types::STRING, unique: true)]
    private readonly string $name;

         #[Deprecated(
            reason: 'since Symfony 5.2, use setPublic() instead',
            replacement: '%class%->setPublic(!%parameter0%)'
    )]
    public function __construct(string $name)
    {
        $this->name = $name;
    }

    #[
    ORM\GeneratedValue(  
    value: '44577',
    outcome: 'outcome value'
    ),
    ORM\Column(),
    ORM\CustomIdGenerator(class: test),
    ORM\Id
    ]
    public function updateToken(string $series, #[\SensitiveParameter] string $token_value, \DateTime $last_used)
    {
        echo "token UPDATE";
    }
}


    #[FooAttribute]
function foo_func(#[FooParamAttrib('Foo1')] $foo)
{
}


    #[FooAttribute('hello')]
#[BarClassAttrib(42)]
class Foo
{
#[ConstAttr]
#[FooAttribute(null)]
    private const FOO_CONST = 28;
    private const BAR_CONST = 28;

#[PropAttr(Foo::BAR_CONST, 'string')]
    private string $foo;

        #[SomeoneElse\FooMethodAttrib]
    public function getFoo(#[FooClassAttrib(28) ] $a): string
    {
    }

}

    #[Attribute]
class FooAttribute
{
    public function __construct(string $param1)
    {
    }
}