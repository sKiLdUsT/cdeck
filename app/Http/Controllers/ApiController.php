<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Vluzrmos\LanguageDetector\Facades\LanguageDetector;
use Auth;
use App\Http\Requests;
use URL;
use Twitter;
use Cache;
use DB;
use Storage;
use App;

class ApiController extends Controller
{
    public function __construct()
    {
        App::setlocale(Request()->input('lang', (Auth::user() && isset(json_decode(Auth::user()->uconfig)->lang)) ? json_decode(Auth::user()->uconfig)->lang : LanguageDetector::detect()));
    }
    public function getToken(){
        $account = Request()->input('id', '0');
        $user = Auth::user();
        if($user){
            $accounts = json_decode($user->accounts);
            $requestAccount = json_decode($accounts[$account]->token);
            if(!isset($requestAccount->api_token)){
                $api_token = str_random(16);
                $requestAccount->api_token = $api_token;
                $accounts[$account]->token = json_encode($requestAccount);
                $user->accounts = json_encode($accounts);
                $user->save();
            }else{
                $api_token = $requestAccount->api_token;
            }
            return(json_encode(array(
                    'oauth_token' => $requestAccount->oauth_token,
                    'oauth_token_secret' => $requestAccount->oauth_token_secret,
                    'screen_name' => $requestAccount->screen_name,
                    'api_token' => $api_token
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
    public function uconfig()
    {
        $user = Auth::user();
        $settings = Request()->input();
        if($user)
        {
            $uconfig = json_decode($user->uconfig);
            if(Request()->method() == 'POST')
            {
                foreach($settings as $setting => $value)
                {
                    switch($setting)
                    {
                        case "colormode":
                            $uconfig->colormode = $value;
                            break;
                        case "notifications":
                            $uconfig->notifications = $value;
                            break;
                        case "access_level":
                            return json_encode(["response" => "unauthorized"]);
                            break;
                    }
                }
                $user->uconfig = json_encode($uconfig);
                $user->save();
                return json_encode(["response" => true, "data" => $user->uconfig]);
            }
            return $user->uconfig;
        }
        return json_encode(["response" => false]);
    }
    public function lang(){
        return json_encode([
            "external" => trans('external'),
            "menu" => trans('menu'),
            "message" => trans('message'),
            "blog" => trans('blog')
        ]);
    }
    public function ping(){
        return "{response: true}";
    }
    public function blogPreview()
    {
        $parser = new \Golonka\BBCode\BBCodeParser;
        $post = Request()->input();
        $title = $post["title"];
        $content = $parser->parse($post["content"]);
        $deliver = 'raw';
        return view('blog.preview', compact('title', 'content', 'deliver'));
    }
    public function blogNew()
    {
        $parser = new \Golonka\BBCode\BBCodeParser;
        $post = Request()->input();
        $blog = new App\Blog;

        $blog->uid = Auth::user()->id;
        $blog->show = (json_decode(Auth::user()->uconfig)->access_level == 2) ? 1 : 0;
        $blog->title = $post["title"];
        $blog->content = $parser->parse($post["content"]);
        if($blog->save()){
            return (json_encode(["response" => true, "id" => $blog->id]));
        }
        return "{response: false}";
    }
    public function voiceNew()
    {
        if(Auth::user()){
            $voice = new App\Voice;
            $user = Auth::user();
            $data = base64_decode(str_replace('data:audio/mpeg;base64,', '', Request()->input('data')));
            $id = str_random(9);
            Storage::disk('voices')->put($user->id.'/'.$id.'.mp3', $data);

            $voice->id = $id;
            $voice->uid = $user->id;
            $voice->path = '/cdn/voices/'.$user->id.'/'.$id.'.mp3';
            $voice->save();

            return json_encode([
                "response" => true,
                "path" => url('voice/'.$id)
            ]);
        }
        return "{response: false}";
    }
}
