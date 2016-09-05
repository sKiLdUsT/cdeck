<?php

namespace App\Http\Controllers;

use App\Http\Requests;
use Illuminate\Http\Request;
use Vluzrmos\LanguageDetector\Facades\LanguageDetector;
use DB;
use Twitter;
use Session;
use Auth;

class HomeController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth');
        \App::setlocale(Request()->input('lang', (Auth::user() && isset(json_decode(Auth::user()->uconfig)->lang)) ? json_decode(Auth::user()->uconfig)->lang : LanguageDetector::detect()));
    }


    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        if (env('APP_BETA') == 'true') {
            if (!$request->session()->has('beta_key')) {
                $request->session()->put('beta_key', json_decode($user)->beta_key);
            }
        }
        $accounts = json_decode(Auth::user()->accounts, false);
        try{
            foreach( $accounts as $account){
                $account->avatar = Twitter::query('users/show', 'GET', ['screen_name' => $account->handle])->profile_image_url_https;
                $account->banner = Twitter::query('users/show', 'GET', ['screen_name' => $account->handle])->profile_banner_url;
            }
            Auth::user()->accounts = json_encode($accounts);
        } catch (\Exception $e) {
            #return redirect()->route('twitter.login');
        }
        $user->save();
        $title = 'Home - ';
        $clients = json_decode(file_get_contents('https://toolbox.kontrollraum.org/cdeck/'));
        $deliver = $request->input('deliver', 'null');
        return view('app.home', compact('title', 'deliver', 'clients', 'accounts'));
    }
}
