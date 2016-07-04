<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests;
use Session;

class SiteController extends Controller
{
    public function login(Request $request){
        if (env('APP_BETA') == 'true') {
            if (!$request->session()->has('beta_key')) {
                return redirect()->route('beta');
            }
        }
        $title = 'Login - ';
        $deliver = $request->input('deliver', 'null');
        $hideNavbar = true;
        return view('auth.login', compact('title', 'deliver', 'hideNavbar'));
    }
    public function beta(Request $request){
        if (env('APP_BETA') == 'beta') {
            if ($request->session()->has('beta_token')) {
                return redirect()->route('index');
            }
        }
        $title = 'Beta Token - ';
        $deliver = $request->input('deliver', 'null');
        $hideNavbar = true;
        return view('auth.beta', compact('title', 'deliver', 'hideNavbar'));
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
        return view('auth.register', compact('title', 'deliver', 'hideNavbar'));
    }
    public function impressum(){
        $title = 'Impressum - ';
        $request = Request();
        $deliver = $request->input('deliver', 'null');
        $hideNavbar = true;
        return view('app.impressum', compact('title', 'deliver', 'hideNavbar'));
    }
    public function datenschutz(){
        $title = 'Datenschutz - ';
        $request = Request();
        $deliver = $request->input('deliver', 'null');
        $hideNavbar = true;
        return view('app.datenschutz', compact('title', 'deliver', 'hideNavbar'));
    }
}
