<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;

class ApiController extends Controller
{
    public function getToken(){
        if(session()->get('access_token')['oauth_token'] AND session()->get('access_token')['oauth_token']){
            return(json_encode(array(
                    'oauth_token' => session()->get('access_token')['oauth_token'],
                    'oauth_token_secret' => session()->get('access_token')['oauth_token_secret']
                )));
        }else{
            return(json_encode(array('error' => 'unauthorized')));
        }
    }
    public function getSession(){
        return(json_encode(session()->all()));
    }
}
