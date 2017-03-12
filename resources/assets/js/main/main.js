// App Global variable
window.$app = {
    state: 'loading',
    version: '0.8b',
    tconfig_url: '/api/twitter/tconfig',
    uconfig_url: '/api/uconfig',
    lang_url: '/api/lang?lang=',
    user_url: '/api/twitter/getToken',
    upstream_url: '/api/upstream',
    activeID: 0,
    chats: {}
};

var loadingCounter = 0;

// Is called by config load AJAX to count loaded scripts
var loadingTimeout;
function loadingDone(){
    loadingCounter++;
    if(loadingCounter == 3){
        log.info('Client: All ressources loaded');
        clearTimeout(loadingTimeout);
        afterLoad();
    } else if(loadingCounter == 1) {
        loadingTimeout = setTimeout(function () {
            console.error('Client: Loading failed. Loading stage: '+loadingCounter);
        }, 10000);
    }
}


// Runs after all configs are loaded
function afterLoad(){
    // Remove loader
    $('.loader').fadeOut(300);
    log.debug('UI: All ressources loaded. Removing loader');

    // Show info when cookies are disabled
    if (!navigator.cookieEnabled) {
        $($('noscript').html()).prependTo('body').show();
        $('.splash').fadeOut();
        return;
    }

    // Check if cookie notice was displayed
    if(getCookieValue('cookie_notice') !== 'true'){
        try {
            var colormode = uconfig.colormode == "1" ? 'grey darken-3 white-text' : '';
        } catch(e) {
            log.warn('UI: '+e);
            var colormode = '';
        }
        var modalNumber = spawnModal();
        var modal = $('#modal' + modalNumber);
        modal.addClass('bottom-sheet');
        modal.openModal({
            dismissible: false, ready: function () {
                $('#modal' + modalNumber + '-content').html('<p>'+lang.external.cookies+'</p>');
                $('<div class="modal-footer '+colormode+'"><a class="modal-action modal-close waves-effect btn-flat '+colormode+'">Ok!</a></div>').appendTo(modal).on('click', function() {
                    modal.closeModal();
                    var expiration_date = new Date();
                    expiration_date.setFullYear(expiration_date.getFullYear() + 1);
                    document.cookie = "cookie_notice=true; path=/; expires=" + expiration_date.toUTCString();
                    modal.remove();
                });
            }
        });
    }

    // Run health check
    healthCheck('/api/ping');

    // Functions to run when on login page
    if ( window.location.pathname.indexOf('/login') !== -1) {
        $('body').css({overflow: 'hidden', 'background-image': 'url(/assets/img/bg.png)', 'background-size': 'cover'})
    }

    // Functions to run when on home page
    if ( window.location.pathname == '/' ) {
        homePage();
    }
}

// Runs after page load
$(function(){
    // Set local user background, if set
    try {
        if (typeof(Storage) !== "undefined" && localStorage.getItem("background")) $('body').css('background-image', 'url('+localStorage.getItem("background")+')');
    } catch(e) {
        log.warn('UI: '+e);
    }

    // Get Twitter-config.
    // cDeck calls the Twitter-API every 24h for this.
    // More: http://bit.ly/2cjQYc2
    $.get( $app.tconfig_url, function ( data ) {
        // Only set when not previously defined.
        if( data !== null && window.tconfig === undefined ) {
            log.debug('Client: Recieved tconfig');
            window.tconfig = data;
            loadingDone();
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
            loadingDone();
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
                            log.debug('Client: Recieved translation');
                            window.lang = data;
                            loadingDone();
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
                            log.debug('Client: Recieved translation');
                            window.lang = data;
                            loadingDone();
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

});
