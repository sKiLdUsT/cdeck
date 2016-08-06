<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Auth;
use App\Http\Requests;
use URL;
use Twitter;
use Cache;

class ApiController extends Controller
{
    public function getToken(){
        $account = Request()->input('id', '0');
        $user = Auth::user();
        if($user){
            $accounts = json_decode($user->accounts);
            $requestAccount = json_decode($accounts[$account]->token);
            return(json_encode(array(
                    'oauth_token' => $requestAccount->oauth_token,
                    'oauth_token_secret' => $requestAccount->oauth_token_secret,
                    'screen_name' => $requestAccount->screen_name
                )));
        }else{
            return(json_encode(array('error' => 'unauthorized')));
        }
    }
    public function getSession(){
        return(json_encode(session()->all()));
        //$user = Auth::user();
        //return($user);
    }
    public function assets(){
        return json_encode(array("css" => URL::to(elixir('assets/css/app.css')), "js" => URL::to(elixir('assets/js/app.js'))));
    }
    public function tconfig(){
        return json_encode(Cache::get('twitter_config'));
    }
    public function setTconfig(){
        $config = Twitter::get('help/configuration');
        Cache::put('twitter_config', $config, 1440);
        return json_encode(array("response" => true));
    }
}
