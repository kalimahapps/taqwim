<?php
try {
    throw new Exception('Some message');
} catch (Exception $e) {
    echo $e->getMessage();
}

try {
    new className();
} catch(Exception $e){
    echo $e->getMessage();
}