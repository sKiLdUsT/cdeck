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
    //mix.copy('node_modules/materialize-css/js', 'resources/assets/js/materialize');
    //mix.copy('node_modules/materialize-css/materialize/date_picker/*.js', 'resources/assets/materialize/materialize');
    //mix.src('node_modules/materialize-css/materialize/materialize.js', 'resources/assets/js');
    //mix.scriptsIn('resources/assets/materialize/materialize', 'resources/assets/materialize/materialize.js');
    mix.scripts([
        "materialize/initial.js",
        "materialize/jquery.easing.1.3.js",
        "materialize/animation.js",
        "materialize/velocity.min.js",
        "materialize/hammer.min.js",
        "materialize/jquery.hammer.js",
        "materialize/global.js",
        "materialize/collapsible.js",
        "materialize/dropdown.js",
        "materialize/leanModal.js",
        "materialize/materialbox.js",
        "materialize/parallax.js",
        "materialize/tabs.js",
        "materialize/tooltip.js",
        "materialize/waves.js",
        "materialize/toasts.js",
        "materialize/sideNav.js",
        "materialize/scrollspy.js",
        "materialize/forms.js",
        "materialize/slider.js",
        "materialize/cards.js",
        "materialize/chips.js",
        "materialize/pushpin.js",
        "materialize/buttons.js",
        "materialize/transitions.js",
        "materialize/scrollFire.js",
        "materialize/date_picker/picker.js",
        "materialize/date_picker/picker.date.js",
        "materialize/character_counter.js",
        "materialize/carousel.js"
    ], 'resources/assets/js/materialize.js');
    mix.scripts([
        'pace.js',
        'socket-io.js',
        'jquery.js',
        'materialize.js',
        'twitter-text.js',
        'cdeck-client.js',
        'app.js'
    ], 'public/assets/js/app.js');
    mix.version(['assets/css/app.css', 'assets/js/app.js']);
    mix.copy('node_modules/materialize-css/fonts', 'public/build/assets/fonts')
});
