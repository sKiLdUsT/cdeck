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
    mix.sass(['app.scss','pace.scss'], 'public/assets/css');
    mix.scripts([
        'pace.js',
        'socket-io.js',
        'jquery.js',
        'cdeck-client.js',
        'app.js'
    ], 'public/assets/js/app.js');
    mix.version(['assets/css/app.css', 'assets/js/app.js']);
    mix.copy('node_modules/materialize-css/fonts', 'public/build/assets/fonts')
});
