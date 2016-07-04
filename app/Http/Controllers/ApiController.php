<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Auth;
use App\Http\Requests;
use Twitter;

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
        //$user = Auth::user();
        //return($user);
    }
    public function postTweet(Request $request){
        #if($_POST[])
        #return $request->all();
        $input = (object) $_POST;
        $output = ['status' => $input->status,'format' => 'json'];
        if(isset($input->in_reply_to_status_id)){$output['in_reply_to_status_id']=$input->in_reply_to_status_id;}
        if(isset($input->lat)){$output['lat']=$input->lat;}
        if(isset($input->long)){$output['long']=$input->long;}
        if(isset($input->place_id)){$output['place_id']=$input->place_id;}
        if(isset($input->media_ids)){$output['media_ids']=$input->media_ids;}
        return Twitter::postTweet($output);
    }
}
