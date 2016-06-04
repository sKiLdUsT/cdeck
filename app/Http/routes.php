<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

Route::group(['middleware' => 'web'], function () {
    Route::auth();
    Route::get('/', 'HomeController@home');
    Route::get('/login', 'SiteController@login');
    Route::get('/register', 'SiteController@register');


    Route::get('/test', function()
    {
        return Twitter::getUserTimeline(['screen_name' => 'therealskildust', 'count' => 20, 'format' => 'json']);
    });
});
