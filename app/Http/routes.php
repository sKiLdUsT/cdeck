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

Route::get('/', ['as' => 'index', 'uses' => 'HomeController@index']);

Route::get('/impressum', 'SiteController@impressum');
Route::get('/datenschutz', 'SiteController@datenschutz');
Route::get('/changelog', 'SiteController@changelog');
Route::get('/memo', 'SiteController@memo');

Route::get('/beta', ['as' => 'beta', 'uses' =>'SiteController@beta']);

Route::get('/login', ['as' => 'login', 'uses' =>'SiteController@login']);
Route::post('/auth/beta', ['as' => 'beta.login', 'uses' =>'Auth\AuthController@beta']);
Route::get('auth/twitter', ['as' => 'twitter.login', 'uses' => 'Auth\AuthController@redirectToProvider']);
Route::get('auth/twitter/callback', ['as' => 'twitter.callback', 'uses' => 'Auth\AuthController@handleProviderCallback']);

Route::get('/voice/{id}', 'SiteController@showVoice');

Route::group(['prefix' => 'api'], function ()
{
    Route::get('assets', 'ApiController@assets');
    Route::any('uconfig', 'ApiController@uconfig');
    Route::get('lang', 'ApiController@lang');
    Route::get('ping', 'ApiController@ping');

    Route::group(['prefix' => 'twitter'], function ()
    {
        Route::get('getToken', 'ApiController@getToken');
        Route::get('tconfig', 'ApiController@tconfig');
    });

    Route::group(['prefix' => 'debug'], function ()
    {
        Route::get('getSession', 'ApiController@getSession');
        Route::get('setTconfig', 'ApiController@setTconfig');
    });
    Route::group(['prefix' => 'blog'], function ()
    {
        Route::post('preview', 'ApiController@blogPreview');
        Route::post('new', 'ApiController@blogNew');
    });
    Route::group(['prefix' => 'voice'], function ()
    {
        Route::post('new', 'ApiController@voiceNew');
    });
});

Route::group(['prefix' => 'blog'], function ()
{
    Route::get('/{page?}', 'BlogController@index');
    Route::get('post/{id}', 'BlogController@post');
    Route::get('new', 'BlogController@new');
    Route::get('users', 'BlogController@users');
});