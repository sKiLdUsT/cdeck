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

Route::auth();
Route::get('/', ['as' => 'index', 'uses' => 'HomeController@index']);
Route::get('/impressum', 'SiteController@impressum');
Route::get('/datenschutz', 'SiteController@datenschutz');
Route::get('/memo', 'SiteController@memo');
Route::get('/login', ['as' => 'login', 'uses' =>'SiteController@login']);
Route::get('/beta', ['as' => 'beta', 'uses' =>'SiteController@beta']);
Route::post('/auth/beta', ['as' => 'beta.login', 'uses' =>'Auth\AuthController@beta']);
Route::get('auth/twitter', ['as' => 'twitter.login', 'uses' => 'Auth\AuthController@redirectToProvider']);
Route::get('auth/twitter/callback', ['as' => 'twitter.callback', 'uses' => 'Auth\AuthController@handleProviderCallback']);


Route::group(['prefix' => 'api'], function () {
    Route::group(['prefix' => 'twitter'], function () {
        Route::get('getToken', 'ApiController@getToken');
        Route::post('postTweet', 'ApiController@postTweet');
    });
    Route::group(['prefix' => 'debug'], function () {
        Route::get('getSession', 'ApiController@getSession');
        Route::get('ping', function(){return('{response: true}');});
    });
});