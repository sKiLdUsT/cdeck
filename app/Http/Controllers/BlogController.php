<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Vluzrmos\LanguageDetector\Facades\LanguageDetector;
use App;
use Cache;
use Auth;
use DB;

class BlogController extends Controller
{
    private $user;
    private $table;
    private $deliver;
    private $hideNavbar;
    private $clients;

    private function beforeRun()
    {
        # Set Controller-wide vars (to save time and code)

        # First get the user
        $this->user = Auth::user();

        # Get Client build info from cache (refreshed every 5 minutes through cron)
        $this->clients = Cache::remember('clients', 5, function () {
            return json_decode(file_get_contents('https://cdn.skildust.com/dl/cdeck/meta.json')) ?: (object) [];
        });

        # Get blog table
        $this->table = DB::table('blog');

        # Set general view options
        $this->deliver = Request()->input('deliver', 'null');
        $this->hideNavbar = true;

        # Set language, either from user setting or from browser settings transmitted
        # Otherwise use english. See .env for more details.
        App::setlocale(Request()->input('lang', (isset(json_decode(Auth::user()->uconfig)->lang)) ? json_decode(Auth::user()->uconfig)->lang : LanguageDetector::detect()));
        return true;
    }

    public function index(Request $request, $page = 1)
    {
        $this->beforeRun() ?: App::abort(500);

        # Pagination logic. DONT TOUCH UNLESS IT BROKE DOWN
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

        # View-specific vars
        $title = 'Home - Blog - ';
        $deliver = $this->deliver;
        $hideNavbar = $this->hideNavbar;
        $clients = $this->clients;
        $blogmode = true;

        # Get Content from table
        $content = $this->table->whereBetween('id', [$ccount, $pcount])->get();
        $userinfo = [];
        $page = [
            "all" => intval(ceil($count / 10)),
            "current" => intval($page + 1)
        ];

        # Parse raw DB Data and construct user info
        foreach($content as $post)
        {
            if(!isset($userinfo[$post->uid]))
            {
                $user = DB::table('users')->where('id', $post->uid)->get()[0];
                $userinfo[$post->uid] = [
                    "name" => $user->name,
                    "handle" => $user->handle,
                    "pb" => json_decode($user->media)->avatar
                ];
            }
        }

        if(Auth::user()){
            $accounts = json_decode(Auth::user()->accounts, false);
            $level = isset(json_decode(Auth::user()->uconfig)->access_level) ? json_decode(Auth::user()->uconfig)->access_level : 0;
        }

        if($content == null) return view('blog.index', compact('title', 'deliver', 'hideNavbar', 'clients', 'blogmode', 'accounts', 'level'))->with('error', trans('blog.no_content'));

        return view('blog.index', compact('title', 'deliver', 'hideNavbar', 'clients', 'content', 'blogmode', 'userinfo', 'page', 'accounts', 'level'));

    }
}
