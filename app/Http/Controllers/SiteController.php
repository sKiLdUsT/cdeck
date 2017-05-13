<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App;
use Cache;
use Auth;
use Vluzrmos\LanguageDetector\Facades\LanguageDetector;

class SiteController extends Controller
{
    /*
     |--------------------------------------------------------------------------
     | Site Controller
     |--------------------------------------------------------------------------
     |
     | This controller handles common requests that don't need authentication.
     |
     */

    public $clients;

    public function beforeRun()
    {
        # Set Controller-wide vars (to save time and code)

        # Set language, either from user setting or from browser settings transmitted
        # Otherwise use english. See .env for more details.
        App::setlocale(Request()->input('lang', (!is_null(Auth::user()) && isset(json_decode(Auth::user()->uconfig)->lang)) ? json_decode(Auth::user()->uconfig)->lang : LanguageDetector::detect()));

        # Get Client build info from cache (refreshed every 5 minutes through cron)
        # Otherwise just set it.
        $this->clients = Cache::remember('clients', 5, function () {
            return json_decode(file_get_contents('https://cdn.skildust.com/dl/cdeck/meta.json'));
        });
        return true;
    }

    # Login View
    public function login(Request $request)
    {
        # Fist check if user is already logged in and if so
        # Redirect him back to home page
        if (!is_null(Auth::user())) return redirect()->route('index');

        $this->beforeRun() ?: App::abort(500);

        # Site-specific vars for view
        $title = 'Login - ';
        $deliver = $request->input('deliver', 'null');
        $hideNavbar = true;
        $clients = $this->clients;

        # Return view
        return view('auth.login', compact('title', 'deliver', 'hideNavbar', 'clients'));
    }

    # Imprint View
    public function imprint(Request $request)
    {
        $this->beforeRun() ?: App::abort(500);

        return redirect("https://kontrollraum.org/info/cdeck");
    }

    # Privacy View
    public function privacy(Request $request)
    {
        $this->beforeRun() ?: App::abort(500);

        return redirect("https://kontrollraum.org/info/cdeck");
    }

    # cDeck Voice Message View
    public function showVoice(Request $request, $id)
    {
        $this->beforeRun() ?: App::abort(500);
        # Get Voice Message details
        $vm = App\Voice::where('id', $id)->first();
        if (is_null($vm)) App::abort(404);

        # Get user details
        $user = App\User::where('id', $vm->uid)->first();
        if (is_null($user)) App::abort(500);

        # Construct new user object for view
        $user = (object)[
            "name" => base64_decode($user->name),
            "handle" => $user->handle,
            "avatar" => json_decode($user->media)->avatar,
            "banner" => json_decode($user->media)->banner
        ];

        # Site-specific vars for view
        $title = $user->name . '\'s Voice Message - ';
        $deliver = $request->input('deliver', 'null');
        $url = $vm->path;
        $time = \Carbon\Carbon::createFromFormat('Y-m-d H:i:s', $vm->created_at)->formatLocalized('%A, %d %B %Y %R %Z');
        $voice = true;

        # Return view
        return view('voice', compact('title', 'deliver', 'voice', 'user', 'url', 'time'));
    }
}
