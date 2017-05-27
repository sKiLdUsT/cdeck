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

    protected $user;

    public function __construct(Request $request)
    {
        App::setlocale(Request()->input('lang', (Auth::user() && isset(json_decode(Auth::user()->uconfig)->lang)) ? json_decode(Auth::user()->uconfig)->lang : LanguageDetector::detect()));
    }

    public function checkAuth(Request $request){
        if(Auth::check()){
            $this->user = Auth::user();
        } else {
            if($request->input('api_key')){
                $user = App\User::where('api_token', $request->input('api_key'))->first();
                if(!is_null($user)){
                    $this->user = $user;
                }
            }
        }
    }

    /*
        GET
     */

    # Function to request Twitter Token stuff.
    # Also delivers the API token.
    public function getToken(Request $request)
    {
        $this->checkAuth($request);
        $user = $this->user;
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
                    'api_token' => $api_token,
                    'level' => json_decode($requestAccount->uconfig)->access_level
                ));
            }
            return(response()->json($finalAccount));
        }else{
            return response()->json(['error' => 'unauthorized']);
        }
    }

    # Function to fetch latest server assets
    public function assets()
    {
        return response()->json(array("css" => URL::to(elixir('assets/css/app.css')), "js" => URL::to(elixir('assets/js/app.js'))));
    }

    # Function to fetch Twitter config
    public function tconfig()
    {
        return response()->json(Cache::get('twitter_config'));
    }

    # Function to get cDeck translation stuff
    public function lang()
    {
        return response()->json([
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
                return response()->json(['response' => true]);
                break;
            case 'POST':
                return response()->json(['response' => true]);
                break;
        }
        return App::abort(500);
    }

    # Debug function to get session details
    public function getSession()
    {
        # Only return when in debug mode
        if(!\Config::get('app.debug'))return(json_encode(array('error' => 'Debug functions deactivated')));
        return response()->json(session()->all());
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
        return response()->json(["response" => true]);
    }

    # Function to get/set User Config (depending on request type)
    public function uconfig(Request $request)
    {
        $this->checkAuth($request);
        $user = $this->user;
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
                            return response()->json(["response" => "unauthorized"]);
                            break;
                        case "activeID":
                            $uconfig->activeID = $value;
                            break;
                        case "roundpb":
                            $uconfig->roundpb = $value === 'true'? true: false;;
                            break;
                        case "debugmode":
                            $uconfig->debugmode = $value === 'true'? true: false;;
                            break;
                        case "minimal":
                            $uconfig->minimal = $value === 'true'? true: false;;
                            break;
                    }
                }
                $user->uconfig = json_encode($uconfig);
                $user->save();
                $uconfig = json_decode($user->uconfig);
                return response()->json(["response" => true, "data" => [
                    "colormode" => $uconfig->colormode,
                    "notifications" => session()->get('notifications') ?: false,
                    "access_level" => $uconfig->access_level,
                    "activeID" => isset($uconfig->activeID) ? $uconfig->activeID : 0,
                    "roundpb" => isset($uconfig->roundpb) ? $uconfig->roundpb : true,
                    "debugmode" => isset($uconfig->debugmode) ? $uconfig->debugmode : false,
                    "minimal" => isset($uconfig->minimal) ? $uconfig->minimal: false
                ]]);
            }
            return response()->json([
                "colormode" => $uconfig->colormode,
                "notifications" => session()->get('notifications') ?: false,
                "access_level" => $uconfig->access_level,
                "activeID" => isset($uconfig->activeID) ? $uconfig->activeID : 0,
                "roundpb" => isset($uconfig->roundpb) ? $uconfig->roundpb : true,
                "debugmode" => isset($uconfig->debugmode) ? $uconfig->debugmode : false,
                "minimal" => isset($uconfig->minimal) ? $uconfig->minimal : false
            ]);
        }
        return response()->json(['response' => false]);
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
        $this->checkAuth($request);
        $parser = new \Golonka\BBCode\BBCodeParser;
        $post = $request->input();
        $blog = new App\Blog;

        $blog->uid = $this->user->id;
        $blog->show = (json_decode($this->user->uconfig)->access_level == 2) ? 1 : 0;
        $blog->title = $post["title"];
        $blog->content = $parser->parse($post["content"]);
        if($blog->save()){
            return response()->json(["response" => true, "id" => $blog->id]);
        }
        return response()->json(['response' => false]);
    }

    # Function to create a cDeck Voice Message
    public function voiceNew(Request $request)
    {
        $this->checkAuth($request);
        # Disabled until rework is done
        return response()->json(['response' => false]);
        
        if($this->user){
            $voice = new App\Voice;
            $user = $this->user;
            $data = base64_decode(str_replace('data:audio/mpeg;base64,', '', $request->input('data')));
            $id = str_random(9);
            Storage::disk('voices')->put($user->id.'/'.$id.'.mp3', $data);

            $voice->id = $id;
            $voice->uid = $user->id;
            $voice->path = '/cdn/voices/'.$user->id.'/'.$id.'.mp3';
            $voice->save();

            return response()->json([
                "response" => true,
                "path" => url('voice/'.$id)
            ]);
        }
        return response()->json(['response' => false]);
    }

    # Function to upload videos/images to Twitter
    public function upload(Request $request)
    {
        $this->checkAuth($request);
        # From http://www.go4expert.com/articles/splitting-file-parts-php-t29885/
        function fsplit($file){
            $buffer = 1048576;
            $file_handle = fopen($file,'r');
            $file_size = filesize($file);
            $parts = $file_size / $buffer;

            $file_parts = [];

            for($i=0;$i<$parts;$i++){
                $file_part = fread($file_handle, $buffer);
                array_push($file_parts, $file_part);
            }
            fclose($file_handle);
            return $file_parts;
        }

        if($this->user) {
            if ($request->hasFile('data') && $request->file('data')->isValid())
            {
                try
                {
                    $file = fsplit($request->file('data')->path());
                    $params = ["command" => "INIT", "total_bytes" => filesize($request->file('data')->path()), "media_type" => $request->input('type')];
                    if($request->input('type') == 'video/mp4')$params["media_category" ] = 'tweet_video';
                    $mID = Twitter::query('media/upload', 'POST', $params, true);
                    $mID = $mID->media_id;
                    foreach ($file as $index => $chunk)
                    {
                        Twitter::query('media/upload', 'POST', ["command" => "APPEND", "media_id" => $mID, "segment_index" => $index, "media" => $chunk], true);
                    }
                    $final = Twitter::query('media/upload', 'POST', ["command" => "FINALIZE", "media_id" => $mID], true);
                    if (isset($final->processing_info) && $final->processing_info->state == 'pending')
                    {
                        return response()->json(['response' => true, 'is_pending' => true, "data" => $final]);
                    } else
                    {
                        return response()->json(['response' => true, 'is_pending' => false, "data" => $final]);
                    }
                } catch (\Exception $e)
                {
                    return response()->json(['response' => false]);
                }
            }
            return response()->json(['response' => false]);
        }
        return response()->json(['response' => false]);
    }

    # Function to check Twitter async upload status
    public function upload_status(Request $request)
    {
        $this->checkAuth($request);
        # Only continue if id is set
        $id = $request->input('id');
        if($id)
        {
            try
            {
                $status = Twitter::query('media/upload', 'GET', ["command" => "STATUS", "media_id" => $id], true);
                if($status->processing_info->state == 'succeeded')
                {
                    return response()->json(['response' => true, 'data' => $status]);
                }
                else if($status->processing_info->state == 'failed')
                {
                    http_response_code(500);
                    return response()->json(['response' => false, 'data' => $status]);
                }
                else return response()->json(['response' => false, 'data' => $status]);
            }catch (\Exception $e)
            {
                # For some odd reason, Twitter API likes to throw "400 Unknown Error"
                # when checking for async media processing status
                # For now it's sufficient to just tell the client everything finished.
                # Definitely have to look into that again (Maybe when the docs aren't broken anymore)
                return response()->json(['response' => true]);
                //return App::abort(500, 'Twitter API failed');
            }
        }
        return App::abort(400, 'Bad Request');
    }

    # Function to get cDeck To-Go code
    public function togo(Request $request)
    {
        $this->checkAuth($request);

        $user = $this->user;

        if($user)
        {
            if(is_null($user->togo)){
                $user->togo = str_random(6);
                $user->save();
            }

            return response()->json([
                "response" => true,
                "token" => $user->togo
            ]);
        } else {
            return response()->json(['response' => false]);
        }
    }

    public function redeem(Request $request){
        if(!is_null($request->input('token')))
        {
            $user = App\User::where(['togo' => $request->input('token')])->first();
            if($user)
            {
                return response()->json([
                    "response" => true,
                    "token" => $user->api_token
                ]);
            } else {
                return response()->json(['response' => false]);
            }
        } else {
            return response()->json(['response' => false]);
        }
    }
}
