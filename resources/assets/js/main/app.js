// App Global variable
window.$app = {
    state: 'loading',
    version: '0.7a',
    tconfig_url: '/api/twitter/tconfig',
    uconfig_url: '/api/uconfig',
    lang_url: '/api/lang?lang=',
    user_url: '/api/twitter/getToken',
    upstream_url: '/api/upstream',
    activeID: 0,
    chats: {}
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
                sizeSet = 0;
                log.info('Upstream: successfully registered')
            }
            break;
        case 'client_recievedData':
            log.debug('Upstream: Recieved data');
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
                log.debug('Renderer: Rendering without animations');
                data.forEach(function (item) {
                    renderer.display(item, cDeck, {animate: false});
                });
            } else {
                log.debug('Renderer: Rendering with animations');
                data.forEach(function (item) {
                    renderer.display(item, cDeck);
                });
            }

            break;
        case 'client_reconnect':
            log.info('Upstream: Connection reestablished');
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
            log.warn('Upstream: Connection lost');
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
            log.debug('Client: App state changed: ready');
            $app.state = 'ready';
            //cDeck.getDMs();
            break;
        case 'client_tweet_sent':
            log.debug('Upstream: Tweet sent');
            if (typeof $voiceblob != 'undefined'){
                log.debug('Was voice message');
                window.$voiceblob = undefined
            }
            $('.bottom-sheet').closeModal();
            $('.bottom-sheet').remove();
            Materialize.toast('Tweet sent', 2000);
            break;
        case 'client_tweet_error':
            log.debug('Upstream: Tweet failed. '+data);
            if (typeof $voiceblob != 'undefined'){
                window.$voiceblob = undefined
            }
            $('.bottom-sheet').closeModal();
            $('.bottom-sheet').remove();
            Materialize.toast('Failed to sent tweet: '+data, 2000);
            break;
        case 'client_retweet_sent':
            log.debug('Upstream: Retweet sent. ID was '+data);
            Materialize.toast('Retweeted.', 2000);
            $('#tweet-' + data + ' #retweet').html('<i class="material-icons">repeat</i>');
            break;
        case 'client_tweet_error':
            log.debug('Upstream: Tweet failed.');
            $('.lean-overlay').trigger('click');
            break;
        case 'client_like_sent':
            log.debug('Upstream: Like sent. ID was '+data);
            $('#tweet-' + data + ' #like').html('<i class="material-icons">favorite</i>');
            break;
        case 'client_removedTweet':
            log.debug('Client: Removed a tweet');
            Materialize.toast('Tweet deleted', 2000);
            break;
    }
    return true;
}
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
                        log.debug('Client: Recieved translation');
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
                            log.debug('Client: Recieved translation');
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

    // Show info when cookies are disabled
    if (!navigator.cookieEnabled) {
        $($('noscript').html()).prependTo('body').show();
        $('.splash').fadeOut();
        return;
    }

    setTimeout(function(){
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
                        document.cookie = "cookie_notice=true";
                        modal.remove();
                    });
                }
            });
        }
    }, 2000);

    // Run health check function
    healthCheck('/api/ping');

    // Functions to run when on login page
    if ( window.location.pathname.indexOf('/login') !== -1) {
        $('body').css({overflow: 'hidden', 'background-image': 'url(/assets/img/bg.png)', 'background-size': 'cover'})
    }

    // Functions to run when on home page
    if ( window.location.pathname == '/' ) {
        window.$tweetFile = [];

        // We have to periodically clean up our modals since
        // Materialize is too stupid to fire our cleanup callback
        setInterval(function(){
            $('.modal').each(function(){
                if(!$(this).is(':visible')){
                    log.debug('GC: Cleaned Modal');
                    $(this).remove();
                }
            })
        }, 1000);

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
            log.debug('UI: #newTweet clicked');
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
                log.debug('UI: drag started');
                $('#dragdrop').fadeIn();
            })
            .on('dragleave dragend drop', function() {
                log.debug('UI: drag stopped');
                $('#dragdrop').fadeOut();
            })
            .on('drop', function(e) {
                log.debug('UI: dropped');
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
                               return Materialize.toast('You can\'t mix videos/gifs and images', 3000);
                            } else {
                                return Materialize.toast('Unsupported file type', 3000);
                            }
                        } else if(window.$tweetFile.length < 4){
                            return Materialize.toast('You can only send one video or gif alone at the time', 3000);
                        } else {
                            Materialize.toast('You cannot drop more files', 3000);
                            return console.warn('cDeck: Either 4 image or 1 video/gif limit reached. Object: \n'+JSON.stringify(window.$tweetFile));
                        }
                        if($('.modal').length == 0) {
                            renderer.newTweet();
                        } else {
                            if(!$('.modal').is(':visible')){
                                $('.modal').remove();
                                return renderer.newTweet();
                            }
                            if(!$('#image-holder').is(':visible'))$('#image-holder').fadeIn();
                            var html = '<div class="col s3" id="media-'+(window.$tweetFile.length - 1)+'"><div style="display:none;height:100%;width:100%;position:fixed;background-color:rgba(0,0,0,0.6);border-radius: 10%;" class="valign-wrapper" id="iloader"><div class="progress"><div class="determinate" style="width: 0"></div></div></div> ';
                            if(files[i].type == 'image/png' || files[i].type == 'image/jpeg' || files[i].type == 'image/webp' || files[i].type == 'image/gif'){
                                html += '<img id="tweetMedia" class="responsive-img" src="'+URL.createObjectURL(files[i])+'"></div>'
                            } else if(files[i].type === 'video/mp4'){
                                html += '<video id="tweetMedia" class="responsive-video" controls><source src="'+URL.createObjectURL(files[i])+'" type="'+files[i].type+'"></video></div>'
                            }
                            $(html).appendTo('#image-holder');
                        }
                    }
                } else {
                    Materialize.toast('You cannot drop more fies', 3000);
                    console.warn('cDeck: Either 4 image or 1 video limit reached. Object: \n'+JSON.stringify(window.$tweetFile));
                }
            });
        $('body').pasteImageReader(function(results){
            log.debug('UI: pasted from clipboard');
            if(!$('.modal').is(':visible'))renderer.newTweet();
            if(window.$tweetFile.length < 4 && window.$tweetFile.find(function(object){return (object.type === 'video' || object.type === 'gif')}) === undefined){
                window.$tweetFile.forEach(function(object){
                    if(results.file === object.file)return Materialize.toast('File already added', 2000);
                });
                if(results.file.size > 3145728)return Materialize.toast('Pasted image above 3MB file limit', 2000);
                window.$tweetFile.push({file: results.file, type: 'image'});
                var html = '<div class="col s3" id="media-'+(window.$tweetFile.length - 1)+'"><div style="display:none;height:100%;width:100%;position:fixed;background-color:rgba(0,0,0,0.6);border-radius: 10%;" class="valign-wrapper" id="iloader"><div class="progress"><div class="determinate" style="width: 0"></div></div></div><img id="tweetMedia" class="responsive-img" src="'+results.dataURL+'"></div>';
                if(!$('#image-holder').is(':visible'))$('#image-holder').fadeIn();
                $(html).appendTo('#image-holder');
            } else if(window.$tweetFile.length < 4){
                Materialize.toast('You can only send one video or gif alone at the time', 3000);
            } else {
                Materialize.toast('You cannot drop more fies', 3000);
                console.warn('cDeck: Either 4 image or 1 video/gif limit reached. Object: \n'+JSON.stringify(window.$tweetFile));
            }
        });

        $('.section h4').each(function(){
            $(this).on('click', function(){
                log.debug('UI: ".section h4" clicked');
                $(this).siblings('div').animate({scrollTop:0}, '300', 'swing');
            });
        });
        $('.section div.pad').each(function(){
            $(this).on('scroll', function(){
                if($(this).scrollTop() < $(this).children('div.card:first').outerHeight(true)){
                    log.debug('UI: scrolled to top, removing chip');
                    $(this).siblings('h4').find('span.new.badge').remove();
                }
            });
        });

        setSize($('.section .row .col .section > div'));
        if($(window).width() < 993 ) {
            $('ul.tabs').tabs();
            $('ul.tabs').tabs('select_tab', 'tab1');
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
            log.debug('UI: Updated chip time');
        }, 30000)
    }
    $(window).on('load', function(){
        $('.loader').fadeOut(300);
        log.debug('UI: All ressources loaded. Removing loader')
    });
});