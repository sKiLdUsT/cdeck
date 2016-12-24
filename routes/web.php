<?php

# Main Routes

Route::get('/', ['as' => 'index', 'uses' => 'HomeController@index', 'middleware' => 'auth']);

Route::get('/imprint', 'SiteController@imprint');
Route::get('/privacy', 'SiteController@privacy');
Route::get('/changelog', 'SiteController@changelog');

Route::get('/login', ['as' => 'login', 'uses' =>'SiteController@login']);
# Logout is so simple that we can handle it here
Route::get('/logout', function(){
    Auth::logout();
    return redirect(route('index'));
});
# Voice Messages
Route::get('/voice/{id}', 'SiteController@showVoice');

# Auth
Route::get('auth/twitter', ['as' => 'twitter.login', 'uses' => 'Auth\AuthController@redirectToProvider']);
Route::get('auth/twitter/callback', ['as' => 'twitter.callback', 'uses' => 'Auth\AuthController@handleProviderCallback']);

# Blog Routes

Route::group(['prefix' => 'blog'], function ()
{
    Route::get('/{page?}', 'BlogController@index');
    Route::get('post/{id}', 'BlogController@post');
    Route::get('new', 'BlogController@new');
    Route::get('users', 'BlogController@users');
});
