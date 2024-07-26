<?php
// Correct because it is handled by `psr/indent` rule since it is on a separate line.
Route::middleware(['auth'])->get('/user',
  [UserController::class, 'index']
);

   [UserController::class, ['test'=> 'hello']];