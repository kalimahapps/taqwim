<?php
TRY {
    THROW NEW Exception('Some message');
} CATCH (Exception $e) {
    echo $e->getMessage();
}

try {
    NEW className();
} catch(Exception $e){
    echo $e->getMessage();
}