<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests;

class SiteController extends Controller
{
    public function login(){
        $title = 'Login - ';
        $request = Request();
        $deliver = $request->input('deliver', 'null');
        $hideNavbar = true;
        return view('auth.login', compact('title', 'deliver', 'hideNavbar'));
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
