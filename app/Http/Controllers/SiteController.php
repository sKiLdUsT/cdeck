<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests;

class SiteController extends Controller
{
    public function login(){
        $title = 'Login';
        $request = Request();
        $deliver = $request->input('deliver', 'null');
        $login = true;
        return view('auth.login', compact('title', 'deliver', 'login'));
    }
    public function register(){
        $title = 'Register';
        $request = Request();
        $deliver = $request->input('deliver', 'null');
        $login = true;
        return view('auth.register', compact('title', 'deliver', 'login'));
    }
}
