<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::get('/assets', 'ApiController@assets')->middleware('auth:api');
Route::any('/uconfig', 'ApiController@uconfig')->middleware('auth:api');
Route::get('/lang', 'ApiController@lang')->middleware('auth:api');
Route::any('/ping', 'ApiController@ping')->middleware('auth:api');

Route::group(['prefix' => 'twitter', 'middleware' => 'auth:api'], function ()
{
    Route::get('getToken', 'ApiController@getToken');
    Route::get('tconfig', 'ApiController@tconfig');
});

Route::group(['prefix' => 'debug', 'middleware' => 'auth:api'], function ()
{
    Route::get('getSession', 'ApiController@getSession');
    Route::get('setTconfig', 'ApiController@setTconfig');
});
Route::group(['prefix' => 'blog', 'middleware' => 'auth:api'], function ()
{
    Route::post('preview', 'ApiController@blogPreview');
    Route::post('new', 'ApiController@blogNew');
});
Route::group(['prefix' => 'voice', 'middleware' => 'auth:api'], function ()
{
    Route::post('new', 'ApiController@voiceNew');
});
