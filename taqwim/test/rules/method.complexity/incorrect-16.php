<?php
function complexityTenWithNullSafeOperator() {
	$foo   = $object1->getX()?->getY()?->getZ();
	$bar   = $object2->getX()?->getY()?->getZ();
	$baz   = $object3->getX()?->getY()?->getZ();
	$bacon = $object4->getX()?->getY()?->getZ();
	$bits  = $object5->getX()?->getY()?->getZ();
}