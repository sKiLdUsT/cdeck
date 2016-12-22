<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Vluzrmos\LanguageDetector\Facades\LanguageDetector;
use Auth;
use URL;
use Twitter;
use Cache;
use DB;
use Storage;
use App;

class ApiController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | API Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles API requests.
    |
    */

    public function __construct()
    {
        App::setlocale(Request()->input('lang', (Auth::user() && isset(json_decode(Auth::user()->uconfig)->lang)) ? json_decode(Auth::user()->uconfig)->lang : LanguageDetector::detect()));
    }

    /*
        GET
     */

    # Function to request Twitter Token stuff.
    # Also delivers the API token.
    public function getToken()
    {
        $user = Auth::user();
        if($user){
            $finalAccount = [];
            $accounts = array_merge([$user->handle], json_decode($user->authorized, true) ?: []);
            foreach($accounts as $cuser){
                $requestAccount = DB::table('users')->where('handle', $cuser)->first();
                if($requestAccount->api_token == ""){
                    $api_token = str_random(16);
                    DB::table('users')->where('handle', $cuser)->update(['api_token' => $api_token]);
                }else{
                    $api_token = $requestAccount->api_token;
                }
                $token = json_decode($requestAccount->token);
                array_push($finalAccount, array(
                    'oauth_token' => $token->oauth_token,
                    'oauth_token_secret' => $token->oauth_token_secret,
                    'screen_name' => $requestAccount->handle,
                    'api_token' => $api_token
                ));
            }
            return(json_encode($finalAccount));
        }else{
            return(json_encode(array('error' => 'unauthorized')));
        }
    }

    # Function to fetch latest server assets
    public function assets()
    {
        return json_encode(array("css" => URL::to(elixir('assets/css/app.css')), "js" => URL::to(elixir('assets/js/app.js'))));
    }

    # Function to fetch Twitter config
    public function tconfig()
    {
        return json_encode(Cache::get('twitter_config'));
    }

    # Function to get cDeck translation stuff
    public function lang()
    {
        return json_encode([
            "external" => trans('external'),
            "menu" => trans('menu'),
            "message" => trans('message'),
            "blog" => trans('blog'),
            "disclaimer" => trans('disclaimer'),
            "privacy" => trans('privacy')
        ]);
    }

    # Function to ping Server.
    # Request via POST will later hide analytics payload
    # Why hiding? To prevent AdBlock & Co. to block it
    # ToDo: Explain the usage of analytic data better.
    public function ping(Request $request)
    {
        switch($request->method()){
            case 'GET':
                return "{response: true}";
                break;
            case 'POST':
                return "{response: true}";
                break;
        }
        return App::abort(500);
    }

    # Debug function to get session details
    public function getSession()
    {
        # Only return when in debug mode
        if(!\Config::get('app.debug'))return(json_encode(array('error' => 'Debug functions deactivated')));
        return(json_encode(session()->all()));
    }

    /*
        POST
     */

    # Debug function to set tconfig manually
    public function setTconfig()
    {
        # Only return when in debug mode
        if(!\Config::get('app.debug'))return(json_encode(array('error' => 'Debug functions deactivated')));
        $config = Twitter::get('help/configuration');
        Cache::put('twitter_config', $config, 1440);
        return json_encode(array("response" => true));
    }

    # Function to get/set User Config (depending on request type)
    public function uconfig(Request $request)
    {
        $user = Auth::user();
        $settings = $request->input();
        if($user)
        {
            $uconfig = json_decode($user->uconfig);

            # I decided to go with this approach, because it is slightly
            # safer than letting the user set every value they want.
            # Still maybe not the best solution. ~sKiLdUsT
            if($request->method() == 'POST')
            {
                foreach($settings as $setting => $value)
                {
                    switch($setting)
                    {
                        case "colormode":
                            $uconfig->colormode = $value;
                            break;
                        case "notifications":
                            session()->put('notifications', $value);
                            break;
                        case "access_level":
                            return json_encode(["response" => "unauthorized"]);
                            break;
                        case "activeID":
                            $uconfig->activeID = $value;
                            break;
                        case "roundpb":
                            $uconfig->roundpb = $value;
                            break;
                    }
                }
                $user->uconfig = json_encode($uconfig);
                $user->save();
                $uconfig = json_decode($user->uconfig);
                return json_encode(["response" => true, "data" => [
                    "colormode" => $uconfig->colormode,
                    "notifications" => session()->get('notifications'),
                    "access_level" => $uconfig->access_level
                ]]);
            }
            return json_encode([
                "colormode" => $uconfig->colormode,
                "notifications" => session()->get('notifications'),
                "access_level" => $uconfig->access_level,
                "activeID" => isset($uconfig->activeID) ? $uconfig->activeID : 0,
                "roundpb" => isset($uconfig->roundpb) ? $uconfig->roundpb : true
            ]);
        }
        return json_encode(["response" => false]);
    }

    # Function to render a blog post preview
    # Could be done client-side, but this'll do for now.
    public function blogPreview(Request $request)
    {
        $parser = new \Golonka\BBCode\BBCodeParser;
        $post = $request->input();
        $title = $post["title"];
        $content = $parser->parse($post["content"]);
        $deliver = 'raw';
        return view('blog.preview', compact('title', 'content', 'deliver'));
    }

    # Function to create a new blog post
    public function blogNew(Request $request)
    {
        $parser = new \Golonka\BBCode\BBCodeParser;
        $post = $request->input();
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

    # Function to create a cDeck Voice Message
    public function voiceNew(Request $request)
    {
        if(Auth::user()){
            $voice = new App\Voice;
            $user = Auth::user();
            $data = base64_decode(str_replace('data:audio/mpeg;base64,', '', $request->input('data')));
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
