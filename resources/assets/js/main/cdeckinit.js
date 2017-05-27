var sizeSet, modal, rShow;

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
                modal = $('#modal' + errorModal);
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
                modal = $('#modal' + errorModal);
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