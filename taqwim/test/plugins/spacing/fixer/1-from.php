<?php

/**
 * Test class.
 *
 * @since   1.0.0    This is the version number.
 * @since   1.0.1   This is the version number.
 *
 * @package    Test
 */
class Test {
    /**
     * Constructor method.
     * This is a test
     *
     * @param string    $firstVariable   Description of the parameter.
     * @param    ResponseType $second    Description of the parameter with
     */
    public function __construct($first, $second) {
        echo '';
    }
}

/**
 * Test interface.
 */
interface TestInterface {
    /**
     * Summary of the function.
     *
     * Description of the function.
     *
     * @since    1.0.0 This is the version number.
     *
     * @param     string $firstVariable Description of the parameter.
     * @param     ResponseType     $second Description of the parameter with
     *                              multiple lines.
     *
     * @return     string Description of the return value.
     */
    public function test($first, $second);
}

/**
 * Test trait.
 *
 * @since     1.0.0 This is the version number.
 *
 * @package    Test
 */
trait TestTrait {
    /**
     * Summary of the function.
     *
     * Description of the function.
     *
     * @since     1.0.0 This is the version number.
     *
     * @param string    $firstVariable Description of the parameter.
     * @param     ResponseType    $second Description of the parameter with
     *                              multiple lines.
     *
     * @return     string Description of the return value.
     */
    public function test($first, $second) {
        echo '';
    }
}

/**
 * Summary of the function.
 *
 * Description of the function.
 *
 * @since 1.0.0 This is the version number.
 *
 * @param    string   $firstVariable Description of the parameter.
 * @param    ResponseType    $second Description of the parameter with
 *                              multiple lines.
 *
 * @return  string        Description of the return value.
 */
function test($first, $second) {
    echo '';
}

/**
 * Description of the function.
 *
 * Extra description of the function.
 *
 * @param   Nodes[]   $nodes Array of nodes
 * @param  string   $type Type of node
 * @return array   Array of nodes
 */
function functionWithArrayTypes(array $data, string $second) {
    echo '';
}