<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests;
use Session;
use App;
use Vluzrmos\LanguageDetector\Facades\LanguageDetector;
use Illuminate\Support\Facades\Storage;

class SiteController extends Controller
{
    private $cdndl;
    public function __construct()
    {
        \App::setlocale(Request()->input('lang', (\Auth::user() && isset(json_decode(\Auth::user()->uconfig)->lang)) ? json_decode(\Auth::user()->uconfig)->lang : LanguageDetector::detect()));
        $this->cdndl = 'https://cdn.skildust.com/dl/cdeck/meta.json';
    }
    public function login(Request $request){
        if (env('APP_BETA') == 'true') {
            if (!$request->session()->has('beta_key')) {
                return redirect()->route('beta');
            }
        }
        $title = 'Login - ';
        $deliver = $request->input('deliver', 'null');
        $hideNavbar = true;
        $clients = json_decode(file_get_contents($this->cdndl));
        return view('auth.login', compact('title', 'deliver', 'hideNavbar', 'clients'));
    }
    public function beta(Request $request){
        if (env('APP_BETA') == 'beta') {
            if ($request->session()->has('beta_key')) {
                return redirect()->route('index');
            }
            $title = 'Beta Token - ';
            $deliver = $request->input('deliver', 'null');
            $hideNavbar = true;
            $clients = json_decode(file_get_contents($this->cdndl));
            return view('auth.beta', compact('title', 'deliver', 'hideNavbar', 'clients'));
        }
        return redirect()->route('index');
    }
    public function memo(){
        $title = 'Memo - ';
        $request = Request();
        $deliver = $request->input('deliver', 'null');
        $hideNavbar = true;
        return ("Kommt noch.");
    }
    public function register(){
        $title = 'Register - ';
        $request = Request();
        $deliver = $request->input('deliver', 'null');
        $hideNavbar = true;
        $clients = json_decode(file_get_contents($this->cdndl));
        return view('auth.register', compact('title', 'deliver', 'hideNavbar', 'clients'));
    }
    public function impressum(){
        $title = 'Impressum - ';
        $request = Request();
        $deliver = $request->input('deliver', 'null');
        $hideNavbar = true;
        $clients = json_decode(file_get_contents($this->cdndl));
        return view('app.impressum', compact('title', 'deliver', 'hideNavbar', 'clients'));
    }
    public function datenschutz(){
        $title = 'Datenschutz - ';
        $request = Request();
        $deliver = $request->input('deliver', 'null');
        $hideNavbar = true;
        $clients = json_decode(file_get_contents($this->cdndl));
        return view('app.datenschutz', compact('title', 'deliver', 'hideNavbar', 'clients'));
    }
    public function changelog(){
        $title = 'Changelog - ';
        $request = Request();
        $deliver = $request->input('deliver', 'null');
        $hideNavbar = true;
        $clients = json_decode(file_get_contents($this->cdndl));
        $log = (new \Skildust\Gitlog\Gitlog)->get();
        return view('app.changelog', compact('title', 'deliver', 'hideNavbar', 'clients', 'log'));
    }
    public function showVoice($id){
        $voice = App\Voice::where('id', $id)->first();
        if($voice == null)
        {
            App::abort(404);
        }
        $user = App\User::where('id', $voice->uid)->first();
        if($user == null)
        {
            App::abort(500);
        }

        $user = (object) [
            "name" => $user->name,
            "handle" => $user->handle,
            "avatar" => json_decode($user->media)->avatar,
            "banner" => json_decode($user->media)->banner
        ];

        $title = $user->name.'\'s Voice Message - ';
        $request = Request();
        $deliver = $request->input('deliver', 'null');
        $url = $voice->path;
        $time = \Carbon\Carbon::createFromFormat('Y-m-d H:i:s', $voice->created_at)->formatLocalized('%A, %d %B %Y %R %Z');

        return view('voice', compact('title', 'deliver', 'voice', 'user', 'url', 'time'));
    }
}
