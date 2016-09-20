$(function(){
    function CDeckError( message ) {
        Error.apply( this, arguments );
        this.name = "cDeckError";
        this.message = ( message || "Non-specified error" );

    }

    CDeckError.prototype = Object.create(Error.prototype);

    var sizeSet = 0,
        rShow = 0,
        errorModal = '',
        renderer = new CdeckRenderer();

    // App Global variable
    window.$app = {
        state: 'loading',
        version: ''
    };

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

    // Functions to run when on home page
    if ( window.location.pathname == '/' ) {
        // Set main section to fixed
        $( 'body > .section > main' ).css( 'position', 'fixed' );
        // Add client event listeners when window is ready
        cDeck.init({user_url: '/api/twitter/getToken'}, function( action, data ){
            var errorModal;
            switch( action ){
                case 'client_register':
                    if( data === true){
                        Materialize.toast(lang.external.login, 2000);
                        $('#timeline').empty();
                        $('#notifications').empty();
                        sizeSet = 0
                    } else {
                        if( response.error == "double connect" ){
                            console.log( "cDeck: Double Connect detected." )
                        } else {
                            Materialize.toast( lang.external.login_failed + ': ' + response.error, 2000 );
                        }
                    }
                    break;
                case 'client_recievedData':
                    var selector = $('#timeline, #notifications').children('.preloader-wrapper');
                    if(selector.length > 0){
                        selector.each(function(b, a){$(a).remove()});
                    }
                    if(sizeSet == 0){
                        setSize($('.section .row .col .section > div'));
                        sizeSet = 1
                    }
                    data.forEach(function (item) {
                        renderer.display(item, cDeck);
                    });
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
                    $('#modal' + data).closeModal();
                    if (typeof $voiceblob != 'undefined'){
                        window.$voiceblob = undefined
                    }
                    break;
                case 'client_tweet_error':
                    $('#modal' + data).closeModal();
                    break;
                case 'client_like_sent':
                    $('#tweet-' + data + ' #like i').html('favorite');
                    break;
            }
            return true;
        });
        cDeck.connect();
        $(window).on("beforeunload", function () {
            cDeck.close();
        });
        $('#newTweet').on('click', function () {
            renderer.newTweet(undefined, upstream);
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

    }
});