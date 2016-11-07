<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use DB;
use Auth;
use App;
use Vluzrmos\LanguageDetector\Facades\LanguageDetector;
use App\Http\Requests;

class BlogController extends Controller
{
    private $user;
    private $table;
    private $deliver;
    private $hideNavbar;
    private $clients;

    public function __construct()
    {
        App::setlocale(Request()->input('lang', (Auth::user() && isset(json_decode(Auth::user()->uconfig)->lang)) ? json_decode(Auth::user()->uconfig)->lang : LanguageDetector::detect()));
        $this->user = Auth::user() ?: null;
        $this->table = DB::table('blog');
        $this->deliver = Request()->input('deliver', 'null');
        $this->hideNavbar = true;
        $this->clients = json_decode(file_get_contents('https://cdn.skildust.com/dl/cdeck/meta.json'));
        switch(App::getlocale())
        {
            case "de":
                setlocale(LC_TIME, 'de_DE.utf-8');
                break;
            case "en":
                setlocale(LC_TIME, 'en_US.utf-8');
                break;
            case "fr":
                setlocale(LC_TIME, "fr_FR.utf-8");
                break;
        }
    }
    public function index($page = 1)
    {
        if($page <= 0){$page=1;}
        $page = intval($page);
        $page--;
        $count = $this->table->count();

        if($count - intval($page * 10) >= 1)
        {
            $pcount = ($count - intval($page * 10));
        } else
        {
            $pcount = 1;
        }

        if($pcount - 9 >= 1)
        {
            $ccount = $pcount - 9;
        }else{
            $ccount = 1;
        }

        $title = 'Home - Blog - ';
        $deliver = $this->deliver;
        $hideNavbar = $this->hideNavbar;
        $clients = $this->clients;
        $blogmode = true;

        $content = $this->table->whereBetween('id', [$ccount, $pcount])->get();
        $userinfo = [];
        $page = [
            "all" => intval(ceil($count / 10)),
            "current" => intval($page + 1)
        ];
        foreach($content as $post)
        {
            if(!isset($userinfo[$post->uid]))
            {
                $user = DB::table('users')->where('id', $post->uid)->get()[0];
                $userinfo[$post->uid] = [
                    "name" => $user->name,
                    "handle" => $user->handle,
                    "pb" => json_decode($user->accounts)[0]->avatar
                ];
            }
        }

        if(Auth::user()){
            $accounts = json_decode(Auth::user()->accounts, false);
            $level = isset(json_decode(Auth::user()->uconfig)->access_level) ? json_decode(Auth::user()->uconfig)->access_level : 0;
        }
        if($content == null)
        {
            return view('blog.index', compact('title', 'deliver', 'hideNavbar', 'clients', 'blogmode', 'accounts', 'level'))->with('error', trans('blog.no_content'));
        }
        return view('blog.index', compact('title', 'deliver', 'hideNavbar', 'clients', 'content', 'blogmode', 'userinfo', 'page', 'accounts', 'level'));
    }
    public function post($id)
    {
        $post = $this->table->where('id', $id)->get();
        if($post == null)
        {
            App::abort(404);
        }
        $post = $post[0];
        $user = DB::table('users')->where('id', $post->uid)->get()[0];
        $userinfo = [
            "name" => $user->name,
            "handle" => $user->handle,
            "pb" => json_decode($user->accounts)[0]->avatar
        ];

        $title = $post->title.' - Blog - ';
        $deliver = $this->deliver;
        $hideNavbar = $this->hideNavbar;
        $clients = $this->clients;
        $blogmode = true;
        $onepost = true;

        if(Auth::user()){
            $accounts = json_decode(Auth::user()->accounts, false);
            $level = isset(json_decode(Auth::user()->uconfig)->access_level) ? json_decode(Auth::user()->uconfig)->access_level : 0;
        }

        return view('blog.post', compact('title', 'deliver', 'hideNavbar', 'clients', 'post', 'blogmode', 'onepost', 'userinfo', 'accounts', 'level'));
    }
}
