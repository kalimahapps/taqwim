<?php

/**
 * Test Class
 */
class Test {

    /**
     * @var int $a A
     */
    private $a;
    /**
     * @var int $b B
     */
    private $b;
    /**
     * Test constructor.
     */
    public function __construct() {

        // Inner comment
        $this->a = 1;
        $this->b = 2;
    }

    /**
     * Test
     */
    public function test() {


        /*
        * Block comment
        */
        // Another comment
        $this->a = 1;
        $this->b = 2;
        // Trailing comment
    }
}

/**
 * Common Utilities
 */
trait Common {
	/**
	 * Test constructor.
	 */
	public function log($data) {

		// Inner comment
		if($data) {


			// Inner comment
			echo "DATA";
		}
	}
}
/**
 * Test Interface
 */
interface TestInterface {

	/**
	 * Test constructor.
	 */
	public function log($data);



}

/**
 * Status
 */
enum Status {

	/**
	 * Draft
	 */
    case DRAFT;
    case PUBLISHED;



    case ARCHIVED;

	/**
	 * Color
	 */
    public function color(): string {


        return match($this) {
            Status::DRAFT => 'grey',
            Status::PUBLISHED => 'green',
            Status::ARCHIVED => 'red',
        };
    }
}