<?php
function complexitySixWithNullSafeOperator() {
	$foo = $object1->getX()?->getY()?->getZ();
	$bar = $object2->getX()?->getY()?->getZ();
	$baz = $object3->getX()?->getY()?->getZ();
}