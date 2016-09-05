var elixir = require('laravel-elixir');
/*
 |--------------------------------------------------------------------------
 | Elixir Asset Management
 |--------------------------------------------------------------------------
 |
 | Elixir provides a clean, fluent API for defining some basic Gulp tasks
 | for your Laravel application. By default, we are compiling the Sass
 | file for our application, as well as publishing vendor resources.
 |
 */

elixir(function(mix) {
    mix.sass(['app.scss', 'prism.scss'], 'public/assets/css');
    mix.sass('app.voice.scss', 'public/assets/css');
    //mix.copy('node_modules/materialize-css/js', 'resources/assets/js/materialize');
    //mix.copy('node_modules/materialize-css/materialize/date_picker/*.js', 'resources/assets/materialize/materialize');
    mix.copy('node_modules/materialize-css/bin/materialize.js', 'resources/assets/js');
    mix.copy('node_modules/html5-desktop-notifications/desktop-notify.js', 'resources/assets/js');
    //mix.scriptsIn('resources/assets/materialize/materialize', 'resources/assets/materialize/materialize.js');

    mix.scripts([
        'socket-io.js',
        'jquery.js',
        'materialize.js',
        'materialbox.js',
        'desktop-notify.js',
        'prism.js',
        'WebAudioRecorder.js',
        'shortcut.js',
        'twitter-text.js',
        'fallbackLang.js',
        'cdeck-client.js',
        'app.js',
        'blog.js',
        'menu.js'
    ], 'public/assets/js/app.js');

    mix.scripts([
        'jquery.js',
        'materialize.js',
        'materialbox.js',
        'upload.js',
        'fallbackLang.js',
        'voice/wavesurfer.js',
        'voice/swfobject.js',
        'voice/wavesurfer.swf.js',
        'voice/app.js'
    ], 'public/assets/js/app.voice.js');

    mix.version(['assets/css/app.css', 'assets/js/app.js', 'assets/css/app.voice.css', 'assets/js/app.voice.js']);
    mix.copy('node_modules/materialize-css/fonts', 'public/build/assets/fonts')
});
