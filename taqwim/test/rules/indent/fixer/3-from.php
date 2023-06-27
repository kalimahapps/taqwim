<?php
try 
{
echo inverse(0) . "\n";
} 
catch (ExceptionType1 $e) {
echo inverse(5) . "\n";
} catch (ExceptionType2 $e) {
error_log($e->getMessage());
}
finally {
echo "Final Step";
}

try {
echo inverse(0) . "\n";
} catch (ExceptionType1 $e) {
echo inverse(5) . "\n";
}

try { echo inverse(0) . "\n";
} catch (ExceptionType1 $e) { echo inverse(5) . "\n";
}