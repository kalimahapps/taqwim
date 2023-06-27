<?php

function($param, $param1): boolean{};
function(): float{};
function($param): 
int{};

function
($param
): 
int{};

function($param, $param1): void{};

function(&$first, ? number $nullable, ...$rest): number{}
fn(&$first, ? number $nullable, ...$rest): number 
 => $x;

fn($x) => $x;

$fn1 = fn($x) => $x + $y;
$fn = fn($x) => fn($y) => $x * $y + $z;

fn(): int => $x;
fn(&$x) => $x;
fn&($x) => $x;
fn($x, ...$rest)
 => $rest;