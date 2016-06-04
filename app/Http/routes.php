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
Route::get('/', 'HomeController@index');
Route::get('register', 'RegistrationController@register');
Route::post('register', 'RegistrationController@postRegister');
Route::get('register/confirm/{token}', 'RegistrationController@confirmEmail');
Route::get('login', 'SessionsController@login');
Route::post('login', 'SessionsController@postLogin');
Route::get('logout', 'SessionsController@logout');
Route::get('/impressum', 'SiteController@impressum');
Route::get('/datenschutz', 'SiteController@datenschutz');

Route::get('/usrcontent/{type}/{hash}', function($type = null, $hash = null){
    $file = DB::table('contents')->where('type', '1')->where('hash', $hash);
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    header('Content-Description: File Transfer');
    header('Content-Type: '.finfo_file($finfo, storage_path('app/usrcontent/'.$type.'/'.$file->value('hash'))));finfo_close($finfo);
    header('Content-Disposition: inline; filename='.basename($file->value('name')));
    #header('Content-Transfer-Encoding: binary');
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    header('Content-Length: ' . filesize(storage_path('app/usrcontent/'.$type.'/'.$file->value('hash'))));
    ob_clean();
    flush();
    readfile(storage_path('app/usrcontent/'.$type.'/'.$file->value('hash')));
    exit;
});