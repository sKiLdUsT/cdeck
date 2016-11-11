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
        if (!$request->session()->has('access_token')) {
            $request->session()->put('access_token', json_decode($user->token, true));
        }
        try {
            Twitter::query('account/verify_credentials', 'GET');
        } catch (\Exception $e){
            #return dd(Twitter::logs());
            return redirect(route('login'));
        }

        $rawacc = [];
        $authorized = array_merge([$user->handle], json_decode($user->authorized, true) ?: []);
        foreach($authorized as $cuser) {
            $acc = DB::table('users')->where('handle', $cuser)->first();
            array_push($rawacc, (object) (array_merge(["name" => $acc->name], json_decode($acc->media, true))));
        }
        $accounts = $rawacc;
        $aid = json_decode($user->uconfig)->activeID;
        $title = 'Home - ';
        $clients = json_decode(file_get_contents('https://cdn.skildust.com/dl/cdeck/meta.json'));
        $deliver = $request->input('deliver', 'null');
        return view('app.home', compact('title', 'deliver', 'clients', 'accounts', 'aid'));
    }
}
