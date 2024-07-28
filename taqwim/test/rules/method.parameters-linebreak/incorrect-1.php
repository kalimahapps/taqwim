<?php
    function test(
        $a, $b,
        $c
    ) {};

class CustomerDTO {
        public function __construct( public string $name,
            public string $email,
            public DateTimeImmutable $birth_date
        ) {}
}

class Whatever {
    public function __construct() {
        $this->doAnything('true',
            false
        )->anotherMethod(
            'hello',   'there'
        );
    }
}

new CustomerDTO('hello', 'there',
    new DateTimeImmutable()
);