// App Global variable
window.$app = {
    state: 'loading',
    version: '0.7a',
    tconfig_url: '/api/twitter/tconfig',
    uconfig_url: '/api/uconfig',
    lang_url: '/api/lang?lang=',
    user_url: '/api/twitter/getToken',
    upstream_url: '/api/upstream',
    activeID: 0
};

var renderer = new CdeckRenderer(),
    sizeSet = 0,
    rShow = 0,
    dtimer = 0,
    errorModal = '';

function cDeckInit ( action, data ){
    var errorModal;
    switch( action ){
        case 'client_register':
            if( data === true){
                Materialize.toast(lang.external.login, 2000);
                $('#timeline').empty();
                $('#notifications').empty();
                sizeSet = 0
            }
            break;
        case 'client_recievedData':
            console.log(data);
            var selector = $('#timeline, #notifications').children('.preloader-wrapper');
            if(selector.length > 0){
                selector.each(function(b, a){$(a).hide()});
            }
            if(sizeSet == 0){
                setSize($('.section .row .col .section > div'));
                sizeSet = 1
            }
            if(data.length > 1){
                data.forEach(function (item) {
                    renderer.display(item, cDeck, {animate: false});
                });
            } else {
                data.forEach(function (item) {
                    renderer.display(item, cDeck);
                });
            }

            break;
        case 'client_reconnect':
            if (errorModal === '') {
                errorModal = spawnModal();
                var modal = $('#modal' + errorModal);
                modal.addClass('bottom-sheet');
                modal.openModal({
                    dismissible: false, ready: function () {
                        $('#modal' + errorModal + '-content').text(lang.external.no_upstream);
                        $('#preloader' + errorModal).show();
                    }
                });
            }
            break;
        case 'client_reconnecting':
            if (errorModal === '') {
                errorModal = spawnModal();
                var modal = $('#modal' + errorModal);
                modal.addClass('bottom-sheet');
                modal.openModal({
                    dismissible: false, ready: function () {
                        $('#modal' + errorModal + '-content').text(lang.external.no_upstream);
                        $('#preloader' + errorModal).show();
                    }
                });
            }
            break;
        case 'client_reconn_error':
            if (rShow !== 1) {
                Materialize.toast(lang.external.connection_failed, 5000);
                $.ajax({
                    url: '/api/ping',
                    async: true,
                    timeout: 5000,
                    success: function () {
                        Materialize.toast(lang.external.our_fail, 5000);
                        rShow = 1
                    },
                    error: function () {
                        Materialize.toast(lang.external.your_fail, 5000);
                        rShow = 0
                    }
                });
            }
            break;
        case 'client_ready':
            $app.state = 'ready';
            break;
        case 'client_tweet_sent':
            if (typeof $voiceblob != 'undefined'){
                window.$voiceblob = undefined
            }
            $('.bottom-sheet').closeModal();
            $('.bottom-sheet').remove();
            break;
        case 'client_retweet_sent':
            Materialize.toast('Retweeted.', 2000);
            $('#tweet-' + data + ' #retweet').html('<i class="material-icons">repeat</i>');
            break;
        case 'client_tweet_error':
            $('.lean-overlay').trigger('click');
            break;
        case 'client_like_sent':
            $('#tweet-' + data + ' #like').html('<i class="material-icons">favorite</i>');
            break;
    }
    return true;
}
$(function(){
    // Set local user background, if set
    if (typeof(Storage) !== "undefined" && localStorage.getItem("background")) $('body').css('background-image', 'url('+localStorage.getItem("background")+')');

    // Get Twitter-config.
    // cDeck calls the Twitter-API every 24h for this.
    // More: http://bit.ly/2cjQYc2
    $.get( $app.tconfig_url, function ( data ) {
        // Only set when not previously defined.
        if( data !== null && window.tconfig === undefined ) {
            window.tconfig = data;
            // Only throw if not previously defined
        } else if( window.tconfig === undefined ){
            throw new CDeckError( 'tconfig is null. Contact server administrator.' );
        }
    }, 'json' );

    // Get User-config
    // This returns some user-specific data.
    // See the API-Documentation at: https://developer.cdeck.net/api/rest/
    $.get( $app.uconfig_url, function ( data ) {
        if( data !== null ) {
            window.uconfig = data;
            if(data.activeID !== undefined){
                $app.activeID = data.activeID;
            }
            // Set the Language from uconfig if recieved.
            // Otherwise use language defined in the page HTML
            if( data.lang !== undefined ){
                $.ajax({
                    url: $app.lang_url+data.lang,
                    async: false,
                    dataType: 'json',
                    success: function ( data ) {
                    // Only set if not previously defined
                    if( data !== null && window.lang === undefined ) {
                        window.lang = data;
                    } else if( window.lang === undefined ){
                        throw new CDeckError( 'Couldn\'t get lang file' );
                    }
                },
                    error: function(){
                        throw new CDeckError( 'Couldn\'t get lang file' );
                    }
                });
            } else {
                $.ajax({
                    url: $app.lang_url+$('html').attr('lang'),
                    async: false,
                    dataType: 'json',
                    success: function ( data ) {
                        // Only set if not previously defined
                        if( data !== null && window.lang === undefined ) {
                            window.lang = data;
                        } else if( window.lang === undefined ){
                            throw new CDeckError( 'Couldn\'t get lang file' );
                        }
                    },
                    error: function(){
                        throw new CDeckError( 'Couldn\'t get lang file' );
                    }
                });
            }
        } else {
            throw new CDeckError( 'Couldn\'t recieve uconfig' );
        }

    }, 'json' );

    // Use AJAX navigation when button with specific class is clicked
    $( 'a.ajax-link' ).click(function( e ) {
        ajaxNav($(this));
    });

    // Popout link when button with specific class is clicked
    $( 'a.popout' ).click(function( e ){
        e.preventDefault();
        var MyWindow = window.open($(this).attr('href'),'MyWindow','width=600,height=300');
        return false;
    });

    // Show info when cookies are disabled
    if (!navigator.cookieEnabled) {
        $('div.section').hide();
        $('#nocookies').show();
    } else {
        $('div.section').show();
    }

    // Run health check function
    healthCheck('/api/ping');

    // Functions to run when on login page
    if ( window.location.pathname.indexOf('/login') !== -1) {
        $('body').css({overflow: 'hidden', 'background-image': 'url(/assets/img/bg.png)', 'background-size': 'cover'})
    }

    // Functions to run when on home page
    if ( window.location.pathname == '/' ) {
        window.$tweetFile = [];

        // Set main section to fixed
        $( 'body > .section > main' ).css( 'position', 'fixed' );
        // Add client event listeners when window is ready
        cDeck.init({
            tconfig_url: $app.tconfig_url,
            uconfig_url: $app.uconfig_url,
            lang_url: $app.lang_url,
            upstream_url: $app.upstream_url,
            user_url: $app.user_url
        }, cDeckInit);
        cDeck.connect($app.activeID);
        $(window).on("beforeunload", function () {
            cDeck.close();
        });
        $('#newTweet').on('click', function () {
            renderer.newTweet();
        });

        $('.button-collapse').sideNav({
                closeOnClick: true,
                menuWidth: 300
        });

        $(document).on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
        })
            .on('dragover dragenter', function() {
                $('#dragdrop').fadeIn();
            })
            .on('dragleave dragend drop', function() {
                $('#dragdrop').fadeOut();
            })
            .on('drop', function(e) {
                console.log('File dropped');
                console.log(e.originalEvent.dataTransfer.files);
                if(window.$tweetFile.length < 4 && e.originalEvent.dataTransfer.files.length <= 4){
                    var files = e.originalEvent.dataTransfer.files;
                    for (var i = 0; i < files.length; i++) {
                        window.$tweetFile.forEach(function(object){
                            if(files[i] === object.file)return Materialize.toast('File already added', 2000);
                        });
                        if(window.$tweetFile.length < 4 && window.$tweetFile.find(function(object){return (object.type === 'video' || object.type === 'gif')}) === undefined){
                            if (files[i].type == 'image/png' || files[i].type == 'image/jpeg' || files[i].type == 'image/webp') {
                                if(files[i].size > 3145728)return Materialize.toast('File '+(i+1)+'/'+files.length+' above 3MB file limit', 2000);
                                window.$tweetFile.push({file: files[i], type: 'image'})
                            }else if(files[i].type == 'image/gif' && window.$tweetFile.length === 0){
                                if(files[i].size > 5242880)return Materialize.toast('File '+(i+1)+'/'+files.length+' above 5MB file limit', 2000);
                                window.$tweetFile.push({file: files[i], type: 'gif'})
                            } else if (files[i].type == 'video/mp4' && window.$tweetFile.length === 0 ) {
                                if(files[i].size > 536870912)return Materialize.toast('File '+(i+1)+'/'+files.length+' above 512MB file limit', 2000);
                                $('<video style="display:none;height:0;width:0" id="shadowplayer"><source type="video/mp4" src="'+URL.createObjectURL(files[i])+'"></video>').appendTo('body');
                                var duration;
                                $.when(duration = $('#shadowplayer').duration).then($('#shadowplayer').remove());
                                if(duration > 140)return Materialize.toast('File '+(i+1)+'/'+files.length+' above 1:20 duration limit',2000);
                                window.$tweetFile.push({file: files[i], type: 'video'})
                            } else if (window.$tweetFile.length !== 0){
                                Materialize.toast('You can\'t mix videos/gifs and images', 3000);
                            } else {
                                Materialize.toast('Unsupported file type', 3000);
                                return;
                            }
                        } else if(window.$tweetFile.length < 4){
                            Materialize.toast('You can only send one video or gif alone at the time', 3000);
                        } else {
                            Materialize.toast('You cannot drop more fies', 3000);
                            console.warn('cDeck: Either 4 image or 1 video/gif limit reached. Object: \n'+JSON.stringify(window.$tweetFile));
                        }
                    }
                    if($('.lean-overlay').length > 0)$('.lean-overlay').trigger('click');
                    renderer.newTweet();
                } else {
                    Materialize.toast('You cannot drop more fies', 3000);
                    console.warn('cDeck: Either 4 image or 1 video limit reached. Object: \n'+JSON.stringify(window.$tweetFile));
                }
            });

        setSize($('.section .row .col .section > div'));
        if($(window).width() < 993 ) {
            $('ul.tabs').tabs();
            $('ul.tabs').tabs('select_tab', 'tab2');
        }else{
            $('ul.tabs').undelegate();
            $('main > .row > .col').show();
        }
        $(window).resize(function() {
            if( $(this).width() > 993 ) {
                $('ul.tabs').undelegate();
                $('main > .row > .col').show();
            }else{
                $('.col ~ ul.tabs').show();
                $('ul.tabs').tabs();
                $('ul.tabs').tabs('select_tab', 'tab2');
            }
            body = document.body;
            html = document.documentElement;
            height = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );
            setSize($('.section .row .col .section > div'));
            $('canvas').each(function(index){
                $(this).css('height', $($(this).parent()).innerHeight());
                $(this).css('width', $($(this).parent()).innerWidth())
            })
        });
        setInterval(function(){
            $('.chip.time').each(function(){
                $(this).html(moment($(this).attr('data-time')).fromNow())
            });
        }, 30000)
    }
    $(window).on('load', function(){
        $('.loader').fadeOut(300);
    });
});