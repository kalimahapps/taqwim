<?php

/**
 * This is a test class.
 */
class Test
{
	/**
     * Log info.
     *
     * @param string $message Message to log
     * @return bool True on success, false on failure
     */
    public function logInfo($message)
    {
        echo $message;
        return true;
    }

   /**
 * Log error.
 * @param string $message Message to log
 */
    private function logError($message)
    {
        echo $message;
        return true;
    }
}