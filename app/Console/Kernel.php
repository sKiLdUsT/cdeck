<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        //
    ];

    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        $schedule->call(function () {
            $clients = json_decode(file_get_contents('https://cdn.skildust.com/dl/cdeck/meta.json'));
            Cache::put('clients', $clients, 5);
        })->everyFiveMinutes();
        $schedule->call(function () {
            $config = Twitter::get('help/configuration');
            Cache::put('twitter_config', $config, 1440);
        })->daily();
        $schedule->call(function () {
            $accounts = DB::table('users')->get();
            foreach($accounts as $acc) {
                try {
                    $token = json_decode($acc->token);
                    Twitter::reconfig(['token' => $token->oauth_token, 'secret' => $token->oauth_token_secret]);
                    $media = json_decode($acc->media);
                    $avatar = Twitter::query('users/show', 'GET', ['screen_name' => $acc->handle])->profile_image_url_https;
                    $banner = Twitter::query('users/show', 'GET', ['screen_name' => $acc->handle])->profile_banner_url;
                    $media->avatar = $media->avatar == $avatar ? $media->avatar : $avatar;
                    $media->banner = $media->banner == $banner ? $media->banner : $banner;
                    DB::table('users')->where('name', $acc->name)->update(['media' => json_encode($media)]);
                } catch (\Exception $e) {}
            }
        })->everyFiveMinutes();
    }

    /**
     * Register the Closure based commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        require base_path('routes/console.php');
    }
}
