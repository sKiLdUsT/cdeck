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
    mix.copy('node_modules/materialize-css/bin/materialize.js', 'resources/assets/js/libs');
    mix.copy('node_modules/html5-desktop-notifications/desktop-notify.js', 'resources/assets/js/libs');
    //mix.scriptsIn('resources/assets/materialize/materialize', 'resources/assets/materialize/materialize.js');

    mix.scripts([
        'libs/socket-io.js',
        'libs/jquery.js',
        'libs/materialize.js',
        'libs/materialbox.js',
        'libs/desktop-notify.js',
        'libs/prism.js',
        'libs/WebAudioRecorder.js',
        'libs/shortcut.js',
        'libs/twitter-text.js',
        'libs/wavesurfer.js',
        'libs/cdeck-client.js',
        'main/tools.js',
        'main/renderer.js',
        'main/app.js',
        //'main/blog.js',
        'main/menu.js',
        'main/shortcuts.js'
    ], 'public/assets/js/app.js');

    mix.scripts([
        'libs/jquery.js',
        'libs/materialize.js',
        'libs/materialbox.js',
        'libs/wavesurfer.js',
        'libs/swfobject.js',
        'libs/wavesurfer.swf.js',
        'main/tools.js',
        'voice/app.js',
        'main/shortcuts.js'
    ], 'public/assets/js/app.voice.js');

    mix.version(['assets/css/app.css', 'assets/js/app.js', 'assets/css/app.voice.css', 'assets/js/app.voice.js']);
    mix.copy('node_modules/materialize-css/fonts', 'public/build/assets/fonts')
});
