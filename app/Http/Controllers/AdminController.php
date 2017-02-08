<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App;
use Auth;
use Twitter;
use Cache;
use Vluzrmos\LanguageDetector\Facades\LanguageDetector;
use Tracker;

class AdminController extends Controller
{
    private $user;
    private $uconfig;
    private $clients;

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
        if($this->uconfig->access_level !== 2)
        {
            # Return user to home page
            return 1;
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
            return 2;
        }

        # Set language, either from user setting or from browser settings transmitted
        # Otherwise use english. See .env for more details.
        App::setlocale(Request()->input('lang', (isset(json_decode(Auth::user()->uconfig)->lang)) ? json_decode(Auth::user()->uconfig)->lang : LanguageDetector::detect()));
        return 0;
    }

    public function index(Request $request){

        switch ($this->beforeRun()) {
            case 0:
                break;
            case 1:
                return redirect(route('index'));
                break;
            case 2:
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

        # Return view
        return view('app.admin', compact('title', 'deliver', 'clients'));
    }

    public function get(Request $request){

        switch ($this->beforeRun()) {
            case 0:
                break;
            case 1:
                return redirect(route('index'));
                break;
            case 2:
                return redirect(route('login'));
                break;
            default:
                return App::abort(500);
                break;
        }

        $rawPageViews = Tracker::pageViews(60 * 24 * 30);
        $pageViews = ['date' => [], 'total' => []];
        foreach ($rawPageViews as $date)
        {
            array_push($pageViews["date"], $date->date);
            array_push($pageViews["total"], $date->total);
        }

        $sessions = Tracker::sessions(60 * 24 * 30);
        $rawBrowsers = [];
        $browsers = ['type' => [], 'total' => []];
        $rawCountries = [];
        $countries = ['name' => [], 'total' => []];
        foreach ($sessions as $session)
        {
            if(!isset($rawBrowsers[$session->agent->browser . ' - ' . $session->agent->browser_version]))
            {
                $rawBrowsers[$session->agent->browser . ' - ' . $session->agent->browser_version] = 0;
            }
            $rawBrowsers[$session->agent->browser . ' - ' . $session->agent->browser_version]++;

            if(!is_null($session->geoIp))
            {
                if(!isset($rawCountries[$session->geoIp->country_name]))
                {
                    $rawCountries[$session->geoIp->country_name] = 0;
                }
                $rawCountries[$session->geoIp->country_name]++;
            }
        }

        foreach ($rawBrowsers as $data => $value)
        {
            array_push($browsers['type'], $data);
            array_push($browsers['total'], $value);
        }
        foreach ($rawCountries as $data => $value)
        {
            array_push($countries['name'], $data);
            array_push($countries['total'], $value);
        }

        if($request->wantsJson()){
            return json_encode([
                "pageViews" => $pageViews,
                "browsers" => $browsers,
                "countries" => $countries
            ]);
        }
        return App::abort(405);
    }
}
