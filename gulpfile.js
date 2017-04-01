const elixir = require('laravel-elixir');

require('laravel-elixir-vue-2');

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
elixir.config.sourcemaps = false;
elixir.config.cssOutput = 'assets/css';
elixir.config.jsOutput = 'assets/js';
elixir.config.js.uglify.options.compress.unused = false;

elixir(mix => {
    mix.sass(['app.scss', 'prism.scss'], 'public/assets/css');
    mix.sass('app.voice.scss', 'public/assets/css');
    mix.copy('node_modules/html5-desktop-notifications/desktop-notify.js', 'resources/assets/js/libs');
    mix.scripts([
    'libs/socket-io.js',
    'libs/jquery.js',
    'libs/paste-image-reader.js',
    'libs/materialize.js',
    'libs/materialbox.js',
    'libs/prism.js',
    'libs/shortcut.js',
    'libs/twitter-text.js',
    'libs/wavesurfer.js',
    'libs/twemoji.js',
    'libs/moment.js',
    'libs/moment-timezone.js',
    'libs/qrcode.js',
    'libs/cdeck-client.js',
    'libs/chart.js',
    'main/tools.js',
    'main/home.js',
    'main/menu.js',
    'main/shortcuts.js',
    'main/debug.js',
    'main/renderer.js',
    'main/cdeckinit.js',
    'main/main.js'
    ], 'public/assets/js/app.js')
    .scripts([
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
    mix.copy('node_modules/materialize-css/fonts', 'public/build/assets/fonts');
});
