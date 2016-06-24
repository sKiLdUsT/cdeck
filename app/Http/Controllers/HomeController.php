<?php

namespace App\Http\Controllers;

use App\Http\Requests;
use Illuminate\Http\Request;
use DB;
use Twitter;
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
    public function index(){
        $title = 'Home - ';
        $request = Request();
        $deliver = $request->input('deliver', 'null');
        $user = Auth::user();
        if(!session()->get('access_token')['oauth_token'] OR !session()->get('access_token')['oauth_token_secret'] AND $user->token){
            $access_token = array('oauth_token' => json_decode($user->token)->oauth_token,
            'oauth_token_secret' => json_decode($user->token)->oauth_token_secret);
            session()->put('access_token', $access_token);
        }else{redirect()->route('twitter.login');}
        return view('app.home', compact('title', 'deliver'));
    }
}
