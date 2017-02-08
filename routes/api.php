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

Route::get('/assets', 'ApiController@assets')->middleware('api');
Route::any('/uconfig', 'ApiController@uconfig')->middleware('api');
Route::get('/lang', 'ApiController@lang')->middleware('api');
Route::any('/ping', ['as' => 'ping', 'uses' => 'ApiController@ping'])->middleware('api');
Route::group(['prefix' => 'twitter', 'middleware' => 'api'], function ()
{
    Route::get('getToken', 'ApiController@getToken');
    Route::get('tconfig', 'ApiController@tconfig');
    Route::post('upload', 'ApiController@upload');
    Route::get('upload/status', 'ApiController@upload_status');
});

Route::group(['prefix' => 'debug', 'middleware' => 'api'], function ()
{
    Route::get('getSession', 'ApiController@getSession');
    Route::get('setTconfig', 'ApiController@setTconfig');
});
Route::group(['prefix' => 'blog', 'middleware' => 'api'], function ()
{
    Route::post('preview', 'ApiController@blogPreview');
    Route::post('new', 'ApiController@blogNew');
});
Route::group(['prefix' => 'voice', 'middleware' => 'api'], function ()
{
    Route::post('new', 'ApiController@voiceNew');
});
