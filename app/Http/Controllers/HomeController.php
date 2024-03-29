<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Auth;
use App;
use Twitter;
use Cache;
use DB;
use Vluzrmos\LanguageDetector\Facades\LanguageDetector;

class HomeController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Home Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles requests after the user has authenticated.
    |
    */

    private $user;
    private $uconfig;
    private $accounts;
    public $clients;

    public function beforeRun()
    {
        # Set Controller-wide vars (to save time and code)

        # First get the user
        $this->user = Auth::user();

        # Get Client build info from cache (refreshed every 5 minutes through cron)
        $this->clients = Cache::remember('clients', 5, function () {
            return json_decode(file_get_contents('https://cdn.skildust.com/dl/cdeck/meta.json')) ?: (object) [];
        });

        # Get and parse uconfig
        $this->uconfig = json_decode($this->user->uconfig);

        # Check, if user tokens are still fresh.
        # This is not the case f.e. if the user deactivated themself in the past or
        # revoked access in Twitter Settings
        # Then we just redirect them back to login.
        # This is also a great opportunity to update user media since we get a
        # full user object back from Twitter
        try {
            $data = Twitter::query('account/verify_credentials', 'GET');
            $this->user->media = json_encode([
                'avatar' => isset($data->profile_image_url_https) ? $data->profile_image_url_https : '',
                'banner' => isset($data->profile_banner_url) ? $data->profile_banner_url : '']);
            $this->user->name = base64_encode($data->name);
            $this->user->handle = $data->screen_name;
            $this->user->save();
            $this->user = Auth::user();
        } catch (\Exception $e){
            return 1;
        }

        # Get accounts the user has access to
        # We use a bit odd approach here, just let it be unless it broke down.
        $this->accounts = [DB::table('users')->where('handle', $this->user->handle)->get()->all()[0]];
        foreach(json_decode($this->user->authorized, true) ?: [] as $authorized){
            array_push($this->accounts, DB::table('users')->where('handle', $authorized)->get()->all()[0]);
        }
        foreach($this->accounts as $account){
            $account->media = json_decode($account->media);
        }
        # Set language, either from user setting or from browser settings transmitted
        # Otherwise use english. See .env for more details.
        App::setlocale(Request()->input('lang', (isset(json_decode(Auth::user()->uconfig)->lang)) ? json_decode(Auth::user()->uconfig)->lang : LanguageDetector::detect()));
        return 0;
    }

    public function index(Request $request)
    {
        # Check if the user's access token is set.
        # Sometime it gets unset, for whatever reason. Don't ask me!
        if (!$request->session()->has('access_token')) {
            $request->session()->put('access_token', json_decode(Auth::user()->token, true));
        }

        switch ($this->beforeRun()) {
            case 0:
                break;
            case 1:
                Auth::logout();
                $request->session()->flush();
                return redirect(route('login'));
                break;
            default:
                return App::abort(500);
                break;
        }

        # Site-specific vars for view
        $title = 'Home - ';
        $deliver = $request->input('deliver', 'null');
        $clients = $this->clients;
        $aID = !is_null($this->uconfig) ? $this->uconfig->activeID : 0;
        $accounts = $this->accounts;

        if(!is_null($this->uconfig) && $this->uconfig->highlights == "true"){
            $highlights =  "true";
            $this->uconfig->highlights = "false";
            $this->user->uconfig = json_encode($this->uconfig);
            $this->user->save();
            $this->user = Auth::user();
        } else {
            $highlights = "false";
        }

        # Return view
        return view('app.home', compact('title', 'deliver', 'clients', 'accounts', 'aID', 'highlights'));
    }
}
