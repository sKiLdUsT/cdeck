<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App;
use Auth;
use Twitter;
use Cache;
use Vluzrmos\LanguageDetector\Facades\LanguageDetector;

class AdminController extends Controller
{
    private $user;
    private $uconfig;

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

        # Check, if user is eligible to access this area
        # Reminder: 0 = regular user, 1 = blog access, 2 = admin
        if($this->uconfig->access_level < 2)
        {
            # Return user to home page
            redirect(route('index'));
            die();
        }

        # Check, if user tokens are still fresh.
        # This is not the case f.e. if the user deactivated themself in the past or
        # revoked access in Twitter Settings
        # Then we just redirect them back to login.
        # This is also a great opportunity to update user media since we get a
        # full user object back from Twitter
        try
        {
            $data = Twitter::query('account/verify_credentials', 'GET');
            $this->user->media = json_encode([
                'avatar' => $data->profile_image_url_https,
                'banner' => $data->profile_banner_url]);
            $this->user->name = base64_encode($data->name);
            $this->user->handle = $data->screen_name;
            $this->user->save();
            $this->user = Auth::user();
        }
        catch (\Exception $e)
        {
            redirect(route('login'));
            die();
        }

        # Set language, either from user setting or from browser settings transmitted
        # Otherwise use english. See .env for more details.
        App::setlocale(Request()->input('lang', (isset(json_decode(Auth::user()->uconfig)->lang)) ? json_decode(Auth::user()->uconfig)->lang : LanguageDetector::detect()));
        return true;
    }

    public function index(Request $request){
        $this->beforeRun() ?: App::abort(500);


    }
}
