<?php

namespace App\Http\Controllers;

use App\Http\Requests;
use Illuminate\Http\Request;
use DB;
use Twitter;

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
        $timeline = json_decode(Twitter::getHomeTimeline(['count' => 50, 'format' => 'json']));
        return view('app.home', compact('title', 'deliver', 'timeline'));
    }
}
