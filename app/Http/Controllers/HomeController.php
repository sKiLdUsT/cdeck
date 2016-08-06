<?php

namespace App\Http\Controllers;

use App\Http\Requests;
use Illuminate\Http\Request;
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
        /*if (!$request->session()->get('access_token')['oauth_token'] OR !$request->session()->get('access_token')['oauth_token_secret'] AND $user->token) {
            $access_token = array('oauth_token' => json_decode($user->token)->oauth_token,
                'oauth_token_secret' => json_decode($user->token)->oauth_token_secret);
            $request->session()->put('access_token', $access_token);
        }*/
        try{
            foreach(json_decode($user->accounts) as $account){
                $account->avatar = Twitter::query('users/show', 'GET', ['screen_name' => $account->handle])->profile_image_url_https;
                $account->banner = Twitter::query('users/show', 'GET', ['screen_name' => $account->handle])->profile_banner_url;
            }
        } catch (\Exception $e) {
            #return redirect()->route('twitter.login');
        }
        #try {
            #$user->avatar = Twitter::query('users/show', 'GET', ['screen_name' => $user->handle])->profile_image_url_https;
            #$user->banner = Twitter::query('users/show', 'GET', ['screen_name' => $user->handle])->profile_banner_url;
        #} catch (\Exception $e) {
        #    return redirect()->route('twitter.login');
        #}
        $user->save();
        $title = 'Home - ';
        $accounts = json_decode(Auth::user()->accounts, false);
        $clients = json_decode(file_get_contents('https://api.kontrollraum.org/cdeck/'));
        $deliver = $request->input('deliver', 'null');
        return view('app.home', compact('title', 'deliver', 'clients', 'accounts'));
    }
}
