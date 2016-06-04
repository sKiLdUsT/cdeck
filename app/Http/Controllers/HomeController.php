<?php

namespace App\Http\Controllers;

use App\Http\Requests;
use Illuminate\Http\Request;
use DB;

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
        $hash = DB::table('contents')->where('uid', session()->get('id'))->where('type', '1')->value('hash');
        if($hash != null){$file = '1/'.$hash;}else{$file=null;}
        return view('app.home', compact('title', 'deliver', 'file'));
    }
}
