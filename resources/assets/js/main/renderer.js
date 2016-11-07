/*

    Name: cDeck JS Renderer
    Author: cDeck Team
    Description: JS Library to render cDeck tweets
    Version: 0.6
    Dependencies:   * jQuery (https://jquery.com/download/)
                    * cdeck-client.js (http://bit.ly/2cTMmdX)
    All rights reserved.

 */

(function( global ) {
    var tcount = 0,
        tindex = [],
        self,
        type;
    // Define our "class"
    var Renderer = function (upstream) {
        this.index = {};
        this.config = {};
        self = this;
        if( typeof tconfig == 'undefined' ){
            $.get('/api/twitter/tconfig', function ( data ) {
                if (data !== null) {
                    self.config = data;
                } else {
                    throw new CDeckError('tconfig is null. Contact server administrator.');
                }
            });
        } else {
            this.config = tconfig;
        }
    };

    Renderer.prototype.helper = {
        beforeRender: function( data ){
            if (tcount > 100) {
                tindex.slice(Math.max(this.index.length - 10, 1)).forEach(function (item, indx) {
                    $('#tweet-' + item[indx]).remove();
                })
            }
            if($('#tweet-'+data.id).length >= 1) {
                throw new Error;
            }
        },
        type: function ( data ) {
            if ( data.retweeted_status !== undefined ) {
                return data.retweeted_status;
            } else {
                return data
            }
        },
        linkCards: function ( entities, tweet ){
            var cards;
            entities.forEach(function(item){
                if(item.expanded_url.match(/(?:https:\/\/)?(?:cdeck\.?|dev\.cdeck\.)?(?:skil\.pw?|net)\/(?:voice\/)(.+)/g)){
                    cards = {
                        tweet: tweet.replace(item.url, ''),
                        card: '<iframe src="'+item.expanded_url+'" height="375px" width="100%" style="border: 0" class="z-depth-2"></iframe>'
                    };
                    return cards;
                }
                if (uid = item.expanded_url.match(/(?:http:\/\/|https:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/)){
                    cards = {
                        tweet: tweet.replace(item.url, ''),
                        card: '<div class="video-container z-depth-2"><iframe width="100%" height="315" src="https://www.youtube.com/embed/'+uid[1]+'" frameborder="0" allowfullscreen></iframe></div>'
                    };
                    return cards;
                }
            });
        },
        linkText: function( data ){
            var tweet, cards, marray = [], fav;
            if ( data.entities !== undefined ) {
                marray[0] = '@' + data.user.screen_name;
                type = self.helper.type(data);
                tweet = type.text;
                cards = self.helper.linkCards(type.entities.urls, tweet);
                if (data.quoted_status !== undefined) {
                    tweet = {
                        'main': tweet.replace(/(?:https?|http):\/\/[\n\S]+/g, ''),
                        'sec': data.quoted_status.text
                    };
                } else {
                    tweet = twttr.txt.autoLink(type.text, {urlEntities: type.entities.urls});
                }
                console.log(cards);
                if(typeof cards == 'object'){
                    if( tweet.sec !== undefined ){
                        tweet.main = cards.tweet + cards.card
                    } else {
                        tweet = cards.tweet+cards.card
                    }
                }
                if (data.favorited === true) {
                    fav = 'favorite'
                } else {
                    fav = 'favorite_border'
                }
                type.entities.user_mentions.forEach(function(b, a){
                    marray[a+1] = '@' + b.screen_name
                });
            }
            if( tweet.sec !== undefined ){
                tweet.main = tweet = twemoji.parse(tweet.main);
                tweet.sec = tweet = twemoji.parse(tweet.sec);
            } else {
                tweet = twemoji.parse(tweet);
            }
            return {tweet: tweet, marray: marray !== undefined ? marray : '', fav: fav};
        },
        linkMedia: function ( data ) {
            var medialink,
                type = self.helper.type(data),
                tweet = twttr.txt.autoLink(type.text, {urlEntities: type.entities.urls});
            if (data.extended_entities !== undefined && data.extended_entities.media !== undefined) {
                if(type.extended_entities.media[0].type == 'photo'){
                    if(type.extended_entities.media.length > 1){
                        var a = '<div class"card-image"><div class="slider"><ul class="slides">';
                        type.extended_entities.media.forEach(function(item){
                            a = a+'<li><img src="'+item.media_url_https+'" class="materialboxed" data-caption=\'' + tweet.replace(/'/g, "&#039;") + '\'></li>'
                        });
                        medialink = a+'</ul></div></div>'
                    }else {
                        medialink = '<div class="card-image"><img src="' + type.extended_entities.media[0].media_url_https + '" class="materialboxed" data-caption=\'' + tweet.replace(/'/g, "&#039;") + '\'></div>';
                    }
                }
            }
            return medialink !== undefined ? medialink : '';
        },
        linkAll: function( data ){
            type = self.helper.type(data);
            var objects = self.helper.linkText( data );
            var medialink = self.helper.linkMedia( data );
            return {original: data, tweet: objects.tweet, marray: objects.marray, medialink: medialink, fav: objects.fav}
        },
        favoriteContent: function( data ){
            var type, source, target;
            if(data.object !== undefined){
                if (data.object.text !== undefined && data.object.retweeted_status === undefined && data.object.quoted_status === undefined) {
                    type = 'mention';
                    source = data.object.user;
                    target = data.object;
                } else if (data.object.text !== undefined && data.object.quoted_status === undefined) {
                    type = 'retweet';
                    source = data.object.user;
                    target = data.object.retweeted_status;
                } else if (data.object.text !== undefined && data.object.quoted_status !== undefined){
                    type = 'quote';
                    source = data.object.user;
                    target = data.object;
                }
            }else if(data.target !== undefined)
            {
                if(data.event == 'favorite'){
                    type = 'like';
                    source = data.source;
                    target = data.target_object
                }
            }
            var tweet = twttr.txt.autoLink(target.text, {urlEntities: target.entities.urls});
            return {original: data, tweet: tweet, type: type, source: source, target: target};
        }
    };

    // Templater. Generates and injects templates into the page.
    // Mainly used to display tweet cards and notification cards.
    Renderer.prototype.templater = {
        timeline: function( id, extra, object ) {
            var content, rpb, html,
                colormode = uconfig.colormode == "1" ? 'blue-grey darken-4 white-text' : 'blue-grey lighten-2 white-text';
            if(uconfig.roundpb === true){
                rpb = "circle"
            }
            if (object.original.retweeted_status === undefined && object.original.quoted_status === undefined) {
                content = '<p>' + object.tweet + '</p>'
            } else if (object.original.quoted_status === undefined) {
                content = '<blockquote><div class="card '+colormode+' z-depth-3 tweet" id="tweet-' + object.original.retweeted_status.id_str + '">' + object.medialink + '<div class="card-content"><a target="_blank" href="https://twitter.com/'+object.original.retweeted_status.user.screen_name+'/status/'+object.original.retweeted_status.id_str+'" data-time="'+object.original.retweeted_status.created_at+'" class="chip time waves">' + moment(object.original.retweeted_status.created_at).fromNow() + '</a><span class="card-title left-align"><img src="' + object.original.retweeted_status.user.profile_image_url_https + '" alt="Profilbild" class="'+rpb+' responsive-img">' + object.original.retweeted_status.user.name + '<a target="_blank"id="username" class="grey-text lighten-3" href="https://twitter.com/' + object.original.retweeted_status.user.screen_name + '"> @' + object.original.retweeted_status.user.screen_name + '</a></span><p>' + object.tweet + '</p> </div></blockquote> ';
                object.medialink = '';
            } else if (object.original.quoted_status !== undefined) {
                content = '<p>' + object.tweet.main + '</p><blockquote><div class="card '+colormode+' z-depth-3 tweet" id="tweet-' + object.original.quoted_status.id_str + '">' + object.medialink + '<div class="card-content"><a target="_blank" href="https://twitter.com/'+object.original.quoted_status.user.screen_name+'/status/'+object.original.quoted_status.id_str+'" data-time="'+object.original.quoted_status.created_at+'" class="chip time waves">' + moment(object.original.quoted_status.created_at).fromNow() + '</a><span class="card-title left-align"><img src="' + object.original.quoted_status.user.profile_image_url_https + '" alt="Profilbild" class="'+rpb+' responsive-img pb">' + object.original.quoted_status.user.name + '<a target="_blank"id="username" class="grey-text lighten-3" href="https://twitter.com/' + object.original.quoted_status.user.screen_name + '"> @' + object.original.quoted_status.user.screen_name + '</a></span><p>' + object.tweet.sec + '</p></div></blockquote>';
                object.medialink = '';
            }
            html = '<div class="divider"></div><div class="card '+colormode+' tweet" id="tweet-' + id + '" data-tweet-id="' + id + '" data-mentions="' + object.marray.toString() + '" style="display: none">' + object.medialink + '<div class="card-content"><a target="_blank" href="https://twitter.com/'+object.original.user.screen_name+'/status/'+id+'" data-time="'+object.original.created_at+'" class="chip time waves">' + moment(object.original.created_at).fromNow() + '</a><span class="card-title left-align"><img src="' + object.original.user.profile_image_url_https + '" alt="Profilbild" class="'+rpb+' responsive-img pb">' + twemoji.parse(object.original.user.name) + '<a target="_blank"id="username" class="grey-text lighten-3 " href="https://twitter.com/' + object.original.user.screen_name + '">@' + object.original.user.screen_name + '</a></span>' + content + '</div> <div class="card-action"> <a target="_blank"id="reply" data-in-response="' + id + '" href="#"><i class="material-icons">reply</i></a></a><a target="_blank"id="retweet" class="dropdown-button" data-beloworigin="true" data-activates="dropdown-' + id + '" href="#"><i class="material-icons">repeat</i></a><ul id="dropdown-' + id + '" class="dropdown-content"><li><a target="_blank"id="rt" href="#">Retweet</a></li><li><a target="_blank" id="rt_quote" href="#">Quote Tweet</a></li></ul><a target="_blank" id="like" href="#"><i class="material-icons">' + object.fav + '</i></div></div>';
            if($('.card.tweet').length > 99){
                $('.card.tweet').last().remove();
                $('#timeline').children('div.divider').last().remove();
            }
            if( extra.action == 'prepend' ){
                if(extra.animate !== undefined && extra.animate == false){
                    $(html).prependTo($('#timeline')).show();
                } else {
                    if($('#timeline').scrollTop() !== 0){
                        $(html).prependTo($('#timeline')).slideDown(300);
                        $('#timeline').scrollTop($('#timeline').scrollTop() + 201)
                    } else {
                        $(html).prependTo($('#timeline')).slideDown(300);
                    }
                }
            } else if( extra.action == 'append' ){
                if(extra.animate !== undefined && extra.animate == false){
                    $(html).appendTo($('#timeline')).show();
                } else {
                    if($('#timeline').scrollTop() !== 0){
                        $(html).appendTo($('#timeline')).slideDown(300);
                        $('#timeline').scrollTop($('#timeline').scrollTop() + 201)
                    } else {
                        $(html).appendTo($('#timeline')).slideDown(300);
                    }
                }
            }
        },
        notification: function( id, extra, object ) {
            var content, rpb, html,
                colormode = uconfig.colormode == "1" ? 'blue-grey darken-4 white-text' : 'blue-grey lighten-2 white-text';
            if(uconfig.roundpb === true){
                rpb = "circle"
            }
            if (object.original.quoted_status !== undefined) {
                content = '<p>' + object.tweet.main + '</p><blockquote><div class="card '+colormode+' z-depth-3 tweet" id="tweet-' + object.original.quoted_status.id_str + '"><div class="card-content"><span class="card-title left-align"><img src="' + object.original.quoted_status.user.profile_image_url_https + '" alt="Profilbild" class="'+rpb+' responsive-img">' + object.original.quoted_status.user.name + '<a target="_blank"id="username" class="grey-text lighten-3" href="https://twitter.com/' + object.original.quoted_status.user.screen_name + '"> @' + object.original.quoted_status.user.screen_name + '</a></span><p>' + object.tweet.sec + '</p></div></blockquote>';
            } else {
                content = '<p>' + object.tweet + '</p>'
            }
            html = '<div class="divider"></div><div class="card '+colormode+'" style="display: none"><div class="card-content"><img src="' + object.source.profile_image_url_https + '" alt="Profilbild" class="'+rpb+' responsive-img">' + twemoji.parse(object.source.name) + '<a target="_blank"id="username" class="grey-text lighten-3" href="https://twitter.com/' + object.source.screen_name + '"> @' + object.source.screen_name + '</a> '+lang.external[object.type]+' <br><blockquote><div class="card '+colormode+' z-depth-3 tweet"><div class="card-content"><span class="card-title left-align"><img src="' + object.target.user.profile_image_url_https + '" alt="Profilbild" class="'+rpb+' responsive-img">' + object.target.user.name + '<a target="_blank"id="username" class="grey-text lighten-3" href="https://twitter.com/' + object.target.user.screen_name + '"> @' + object.target.user.screen_name + '</a></span><p>' + content + '</p> </div></blockquote> </div> </div>';
            if( extra.action == 'prepend' ){
                if(extra.animate !== undefined && extra.animate == false){
                    $(html).prependTo($('#notifications')).show();
                } else {
                    if ($('#notifications').scrollTop() !== 0) {
                        $(html).prependTo($('#notifications')).slideDown(300);
                        $('#notifications').scrollTop($('#notifications').scrollTop() + 201)
                    } else {
                        $(html).prependTo($('#notifications')).slideDown(300);
                    }
                }
            } else if( extra.action == 'append' ){
                if(extra.animate !== undefined && extra.animate == false){
                    $(html).appendTo($('#notifications')).show();
                } else {
                    if ($('#notifications').scrollTop() !== 0) {
                        $(html).appendTo($('#notifications')).slideDown(300);
                        $('#notifications').scrollTop($('#notifications').scrollTop() + 201)
                    } else {
                        $(html).appendTo($('#notifications')).slideDown(300);
                    }
                }
            }
        }
    };

    // Function to display a Tweet
    Renderer.prototype.display = function ( data, socket, extra ) {
        if(extra === undefined){
            extra = {action: 'prepend'}
        }
        if( extra.action === undefined ){
            extra.action = 'prepend';
        }
        var finalTweet;
        if ( data.text !== undefined ) {
            finalTweet = this.helper.linkAll( data );
            this.templater.timeline(data.id_str, extra, finalTweet);
            $('#tweet-' + data.id_str + ' .materialboxed').materialbox();
            $('#reply').on('click', function (event) {
                event.preventDefault();
                self.newTweet('reply', $(this).attr('data-in-response'));
            });
            $('#like').on('click', function (event) {
                event.preventDefault();
                var spinner = '<div class="preloader-wrapper very-small active valign"><div class="spinner-layer spinner-blue"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"> <div class="circle"></div> </div><div class="circle-clipper right"> <div class="circle"></div> </div> </div> <div class="spinner-layer spinner-red"> <div class="circle-clipper left"><div class="circle"></div> </div><div class="gap-patch"> <div class="circle"></div> </div><div class="circle-clipper right"> <div class="circle"></div> </div> </div> <div class="spinner-layer spinner-yellow"> <div class="circle-clipper left"> <div class="circle"></div> </div><div class="gap-patch"> <div class="circle"></div> </div><div class="circle-clipper right"> <div class="circle"></div> </div> </div> <div class="spinner-layer spinner-green"> <div class="circle-clipper left"> <div class="circle"></div> </div><div class="gap-patch"> <div class="circle"></div> </div><div class="circle-clipper right"> <div class="circle"></div> </div> </div> </div>';
                $(this).html(spinner);
                cDeck.postLike(data.id_str);
            });
            $('#rt').on('click', function (event) {
                event.preventDefault();
                var spinner = '<div class="preloader-wrapper very-small active valign"><div class="spinner-layer spinner-blue"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"> <div class="circle"></div> </div><div class="circle-clipper right"> <div class="circle"></div> </div> </div> <div class="spinner-layer spinner-red"> <div class="circle-clipper left"><div class="circle"></div> </div><div class="gap-patch"> <div class="circle"></div> </div><div class="circle-clipper right"> <div class="circle"></div> </div> </div> <div class="spinner-layer spinner-yellow"> <div class="circle-clipper left"> <div class="circle"></div> </div><div class="gap-patch"> <div class="circle"></div> </div><div class="circle-clipper right"> <div class="circle"></div> </div> </div> <div class="spinner-layer spinner-green"> <div class="circle-clipper left"> <div class="circle"></div> </div><div class="gap-patch"> <div class="circle"></div> </div><div class="circle-clipper right"> <div class="circle"></div> </div> </div> </div>';
                $('#tweet-' + data.id_str + ' #retweet').html( spinner );
                cDeck.postRt(data.id_str);
            });
            $('#rt_quote').on('click', function (event) {
                event.preventDefault();
                self.newTweet('quote', data.id_str);
            });
            $('.dropdown-button').dropdown();
            $('.slider').slider({full_width: true,indicators: false});
        } else if ( data.delete !== undefined ) {
            $( '#tweet-' + data.delete.status.id_str ).remove();
        } else if ( (data.event == 'favorite' || data.event == 'user-related')) {
            if(( ( data.object !== undefined && data.object.screen_name !== cDeck.user.screen_name) || (data.source !== undefined && data.source.screen_name !== cDeck.user.screen_name) ) ){
                finalTweet = this.helper.favoriteContent( data );
                this.templater.notification( data.id_str, extra, finalTweet );
                if($app.state == "ready" && uconfig.notifications == "true"){
                    notify.createNotification("cDeck", {body: "@"+data.source.screen_name+" "+lang.external.liked, icon: data.profile_image_url_https})
                }
            }
        }
    };

    Renderer.prototype.newTweet = function (type, data) {
        var modalNumber = spawnModal(),
            beforeContent = '',
            tweet = $('#tweet-' + data),
            formExtra = '',
            prefill = '',
            tlength = 140,
            marray = '';
        $('#modal' + modalNumber + '-header').text(lang.external.newtweet);
        switch(type){
            case 'reply':
                beforeContent = '<blockquote>' + $('#tweet-' + data + ' div.card-content').clone().html() + '</blockquote>';
                formExtra = '<input name="in_reply_to_status_id" type="hidden" value="' + data + '">';
                if(tweet.attr('data-mentions') !== undefined){
                    marray = tweet.attr('data-mentions');
                }
                var mentions = (marray.split(',')).filter( function( item, index, inputArray ) {
                    if(item !== '@'+cDeck.user.screen_name){
                        return inputArray.indexOf(item) == index;
                    }
                });
                prefill = (mentions.toString()).replace(',', ' ') + ' ';
                break;
            case 'quote':
                beforeContent = '<blockquote>' + $('#tweet-' + data + ' div.card-content').clone().html() + '</blockquote>';
                tlength = (tlength - 2) - tconfig.short_url_length_https;
                $('#modal' + modalNumber + '-header').text(lang.external.quote_tweet);
                break;
        }
        if (typeof $voiceblob != 'undefined' && type === undefined){
            inReply = '<blockquote><div id="voice-preview"></div><div class="controls center-align col s12"> <a id="play" class="btn waves-effect"><i class="material-icons">play_arrow</i>/<i class="material-icons">pause</i></a> <a id="stop" class="btn waves-effect"><i class="material-icons">stop</i></a> </div></blockquote>'+inReply;
            tlength = (tlength - 2) - tconfig.short_url_length_https
        }
        $('#modal' + modalNumber + '-content').html(beforeContent + '<div class="row"> <form class="col s12 ajax-form" method="post" action="/api/twitter/postTweet"> <div class="row"> <div class="input-field col s12">' + formExtra + '<textarea id="text" class="materialize-textarea" length="'+tlength+'" name="status"></textarea><label for="text">'+lang.external.tweet_something+'</label> </div><button class="btn waves-effect waves-light blue" type="submit">'+lang.external.tweet+'<i class="material-icons right">send</i> </button> </div> </form> </div>');
        $('textarea#text').characterCounter();
        $('#modal' + modalNumber).openModal({
            dismissible: true,
            opacity: .5,
            ready: function(){
                $('#modal' + modalNumber + ' form textarea').focus().val(prefill);
                if (typeof $voiceblob != 'undefined' && type === undefined){
                    var wavesurfer = WaveSurfer.create({
                        container: '#voice-preview',
                        waveColor: 'blue',
                        progressColor: 'red',
                        backgroundColor: '#333333',
                        barWidth: '3',
                        normalize: true
                    });
                    wavesurfer.load(window.URL.createObjectURL($voiceblob));
                    wavesurfer.on('finish', function () {
                        $('#play').removeClass('playing')
                    });
                    $('#play').click(function(e){
                        e.preventDefault();
                        if($(this).hasClass('playing')){
                            wavesurfer.playPause()
                        }else{
                            $(this).addClass('playing');
                            wavesurfer.play()
                        }
                    });
                    $('#stop').click(function(e){
                        e.preventDefault();
                        if($('#play').hasClass('playing')){
                            wavesurfer.stop();
                            $(this).removeClass('playing')
                        }
                    })
                }
            },
            complete: function () {
                $('#modal' + modalNumber).remove()
            }
        });
        $('#modal' + modalNumber + ' form').submit(function (event) {
            event.preventDefault();
            var modalNumber2 = spawnModal();
            var modal = $('#modal' + modalNumber2);
            modal.addClass('bottom-sheet');
            modal.openModal({
                dismissible: false, ready: function () {
                    $('#modal' + modalNumber2 + '-content').text(lang.external.one_moment);
                    $('#preloader' + modalNumber2).show();
                }, complete: function() {
                    modal.remove();
                }
            });
            if (typeof $voiceblob != 'undefined' && type === undefined ){
                var reader = new window.FileReader(),
                    fD = new FormData();
                reader.readAsDataURL($voiceblob);
                reader.onloadend = function() {
                    fD.append('data', reader.result);
                    $.post({
                        url: '/api/voice/new',
                        data: fD,
                        dataType: 'json',
                        processData: false,
                        contentType: false,
                        success: function(e){
                            if(e.response === true){
                                cDeck.postStatus($('#modal' + modalNumber + ' form').serialize() + ' %0D%0A' + e.path);
                            }else{
                                modal.closeModal();
                                throw new CDeckError('Couldn\'t upload voice message');
                            }
                        },
                        error: function(){
                            modal.closeModal();
                            throw new CDeckError('Couldn\'t upload voice message');
                        }
                    });
                };
            }else{
                var extra =  (type !== undefined && type == 'quote') ? (' %0D%0A' + $('#tweet-' + data + ' .card-title #username').attr('href') + '/status/' + data) : '';
                cDeck.postStatus($(this).serialize() + extra);
            }
            $('#modal' + modalNumber).closeModal().remove();
        });
    };

    // Expose our constructor to the global object
    global.CdeckRenderer = Renderer;

})( this );