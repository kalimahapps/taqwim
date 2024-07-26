<?php
Route::middleware( ['auth']  )->get('/user',
  [UserController::class, 'index']
);

[UserController::class,['test'=> 'hello'] ];