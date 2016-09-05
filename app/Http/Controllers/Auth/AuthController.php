<?php

namespace App\Http\Controllers\Auth;

use App\User;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Auth;
use Twitter;
use Session;
use Redirect;
use DB;
use Illuminate\Support\Facades\Input;

class AuthController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Registration & Login Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles the registration of new users, as well as the
    | authentication of existing users. By default, this controller uses
    | a simple trait to add these behaviors. Why don't you explore it?
    |
    */

    protected $redirectPath = '/';

    public function beta(Request $request)
    {
        if(DB::table('keys')->where([['key', $_POST['key']],['used', '0']])->get()){
            $request->session()->put('beta_key', $_POST['key']);
            DB::table('keys')->where('key', $_POST['key'])->update(['used' => 1]);
            return redirect()->route('index');
        }else{
            return redirect()->route('beta')->with('status', 'Key nicht gefunden oder bereits benutzt');
        }
    }

    /**
     * Redirect the user to the Twitter authentication page.
     *
     * @return Response
     */
    public function redirectToProvider()
    {
        $sign_in_twitter = true;
        $force_login = true;

        if(Request()->input('add', 'null') == true){
            Request()->session()->flash('add', 'true');
        }

        // Make sure we make this request w/o tokens, overwrite the default values in case of login.
        Twitter::reconfig(['token' => '', 'secret' => '']);
        $token = Twitter::getRequestToken(route('twitter.callback'));

        if (isset($token['oauth_token_secret']))
        {
            $url = Twitter::getAuthorizeURL($token, $sign_in_twitter, $force_login);

            Session::put('oauth_state', 'start');
            Session::put('oauth_request_token', $token['oauth_token']);
            Session::put('oauth_request_token_secret', $token['oauth_token_secret']);

            return Redirect::to($url);
        }
    }

    /**
     * Obtain the user information from Twitter.
     *
     * @return Response
     */
    public function handleProviderCallback()
    {
        if (Session::has('oauth_request_token'))
        {
            $request_token = [
                'token'  => Session::get('oauth_request_token'),
                'secret' => Session::get('oauth_request_token_secret'),
            ];

            Twitter::reconfig($request_token);

            $oauth_verifier = false;

            if (Input::has('oauth_verifier'))
            {
                $oauth_verifier = Input::get('oauth_verifier');
            }

            // getAccessToken() will reset the token for you
            $token = Twitter::getAccessToken($oauth_verifier);

            if (!isset($token['oauth_token_secret']))
            {
                return Redirect::route('twitter.login')->with('flash_error', 'We could not log you in on Twitter.');
            }

            $credentials = Twitter::getCredentials();

            if (is_object($credentials) && !isset($credentials->error))
            {
                // $credentials contains the Twitter user object with all the info about the user.
                // Add here your own user logic, store profiles, create new users on your tables...you name it!
                // Typically you'll want to store at least, user id, name and access tokens
                // if you want to be able to call the API on behalf of your users.

                // This is also the moment to log in your users if you're using Laravel's Auth class
                // Auth::login($user) should do the trick.

                $authUser = $this->findOrCreateUser($credentials, $token);
                Auth::login($authUser, true);
                return redirect()->route('index');
            }

            return Redirect::route('twitter.error')->with('flash_error', 'Crab! Something went wrong while signing you up!');
        }


    }

    /**
     * Return user if exists; create and return if doesn't
     *
     * @param $twitterUser
     * @param $token
     * @param bool $create
     * @return User
     * @internal param $create
     */
    private function findOrCreateUser($twitterUser, $token, $create = false){

        if(Auth::check()){
            $authUser = Auth::user();
        }else{
            $authUser = User::where('handle', $twitterUser->screen_name)->first();
        }
        $request = Request();

        function searchForHandle($handle, $array) {
            foreach ($array as $key => $val) {
                if ($val['handle'] === $handle) {
                    return true;
                }
            }
            return false;
        }

        if ($authUser OR $create == true){
            $accounts = json_decode($authUser->accounts, true);
            if((env('APP_BETA') == 'true')){$authUser->beta_key = $request->session()->get('beta_key');}
            if(!searchForHandle($twitterUser->screen_name, $accounts)){
                $accounts += [count($accounts) => [
                    'name' => $twitterUser->name,
                    'handle' => $twitterUser->screen_name,
                    'avatar' => isset($twitterUser->profile_image_url_https) ? $twitterUser->profile_image_url_https : '',
                    'banner' => isset($twitterUser->profile_banner_url) ? $twitterUser->profile_banner_url : 'https://pbs.twimg.com/profile_banners/2244994945/1396995246',
                    'token' => json_encode($token)]];
                $authUser->accounts = json_encode($accounts);
            }
            $authUser->save();
            return $authUser;
        }

        return User::create([
            'name' => $twitterUser->name,
            'handle' => $twitterUser->screen_name,
            'twitter_id' => $twitterUser->id,
            'accounts' => json_encode([0 => [
                'name' => $twitterUser->name,
                'handle' => $twitterUser->screen_name,
                'avatar' => isset($twitterUser->profile_image_url_https) ? $twitterUser->profile_image_url_https : '',
                'banner' => isset($twitterUser->profile_banner_url) ? $twitterUser->profile_banner_url : 'https://pbs.twimg.com/profile_banners/2244994945/1396995246',
                'token' => json_encode($token)]]),
            'uconfig' => json_encode([
                'notifications' => false,
                'colormode' => 0,
                'access_level' => 0
            ])
        ]);
    }
}
