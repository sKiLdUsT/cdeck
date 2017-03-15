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
        if( typeof window.tconfig == 'undefined' ){
            $.get('/api/twitter/tconfig', function ( data ) {
                if (data !== null) {
                    self.config = window.tconfig = data;
                } else {
                    throw new CDeckError('tconfig is null. Contact server administrator.');
                }
            });
        } else {
            this.config = window.tconfig;
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
                log.error('Renderer: Tweet already present');
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
                        card: '<iframe src="'+item.expanded_url+'" height="100%" width="100%" style="border: 0" class="z-depth-2"></iframe>'
                    };
                } else if (uid = item.expanded_url.match(/(?:http:\/\/|https:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/)){
                    cards =  {
                        tweet: tweet.replace(item.url, ''),
                        card: '<div class="video-container z-depth-2"><iframe width="100%" height="315" src="https://www.youtube.com/embed/'+uid[1]+'" frameborder="0" allowfullscreen></iframe></div>'
                    };
                }
            });
            return cards;
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
                        'sec': twttr.txt.autoLink(data.quoted_status.text, {urlEntities: data.quoted_status.entities.urls}, {targetBlank: true}).replace(/(?:@<(?:[^>]+)>)([^<]+)(?:[^>]+>)/g, '<a target="_blank" class="username" href="https://twitter.com/$1">@$1</a>')
                    };
                } else {
                    tweet = twttr.txt.autoLink(type.text, {urlEntities: type.entities.urls}, {targetBlank: true}).replace(/(?:@<(?:[^>]+)>)([^<]+)(?:[^>]+>)/g, '<a target="_blank" class="username" href="https://twitter.com/$1">@$1</a>');
                }
                if(typeof cards == 'object'){
                    if( tweet.sec !== undefined ){
                        tweet.main = twttr.txt.autoLink(cards.tweet, {urlEntities: data.quoted_status.entities.urls}, {targetBlank: true}).replace(/(?:@<(?:[^>]+)>)([^<]+)(?:[^>]+>)/g, '<a target="_blank" class="username" href="https://twitter.com/$1">@$1</a>') + cards.card
                    } else {
                        tweet = twttr.txt.autoLink(cards.tweet, {urlEntities: type.entities.urls}, {targetBlank: true}).replace(/(?:@<(?:[^>]+)>)([^<]+)(?:[^>]+>)/g, '<a target="_blank" class="username" href="https://twitter.com/$1">@$1</a>') + cards.card
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
            try {
                if (tweet.sec !== undefined) {
                    tweet.main = twemoji.parse(tweet.main);
                    tweet.sec = twemoji.parse(tweet.sec);
                } else {
                    tweet = twemoji.parse(tweet);
                }
            } catch (e) {
                log.warn('Renderer: '+e)
            }
            return {tweet: tweet, marray: marray !== undefined ? marray : '', fav: fav};
        },
        linkMedia: function ( data ) {
            var medialink,
                type = self.helper.type(data),
                tweet = twttr.txt.autoLink(type.text, {urlEntities: type.entities.urls}).replace(/(?:@<(?:[^>]+)>)([^<]+)(?:[^>]+>)/g, '<a target="_blank" class="username" href="https://twitter.com/$1">@$1</a>');
            if (data.extended_entities !== undefined && data.extended_entities.media !== undefined) {
                if(type.extended_entities.media[0].type == 'photo'){
                    var a = '';
                    type.extended_entities.media.forEach(function(item){
                        a = a+'<img src="'+item.media_url_https+'" class="materialboxed" data-caption=\'' + tweet.replace(/'/g, "&#039;") + '\'>'
                    });
                    medialink = a
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
            var type, source, target, tweet;
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
                } else if(data.event == 'follow'){
                    type = 'follow';
                    source = data.source;
                    target = data.target;
                    tweet = '';
                }
            }
            tweet = tweet !== undefined ? tweet : twttr.txt.autoLink(target.text, {urlEntities: target.entities.urls}).replace(/(?:@<(?:[^>]+)>)([^<]+)(?:[^>]+>)/g, '<a target="_blank" class="username" href="https://twitter.com/$1">@$1</a>');
            return {original: data, tweet: tweet, type: type, source: source, target: target};
        },
        sortDM: function(data){
            if($app.chats[cDeck.user.screen_name] === undefined){
                $app.chats[cDeck.user.screen_name] = {}
            }
            if(data.recipient.screen_name == cDeck.user.screen_name){
                if($app.chats[cDeck.user.screen_name][data.sender.screen_name] === undefined){
                    $app.chats[cDeck.user.screen_name][data.sender.screen_name] = []
                }
                var object = {
                    align: 'left',
                    user: data.sender,
                    message: data.text,
                    entities: data.entities
                };
                $app.chats[cDeck.user.screen_name][data.sender.screen_name].push(object);
                return object;
            } else if(data.sender.screen_name == cDeck.user.screen_name){
                if($app.chats[cDeck.user.screen_name][data.recipient.screen_name] === undefined){
                    $app.chats[cDeck.user.screen_name][data.recipient.screen_name] = []
                }
                var object = {
                    align: 'right',
                    user: data.recipient,
                    message: data.text,
                    entities: data.entities
                };
                $app.chats[cDeck.user.screen_name][data.recipient.screen_name].push(object);
                return object;
            }
        }
    };

    // Templater. Generates and injects templates into the page.
    // Mainly used to display tweet cards and notification cards.
    Renderer.prototype.templater = {
        timeline: function( id, extra, object ) {
            var content, rpb = '', minimal = '', html,
                colormode = window.uconfig.colormode == "1" ? 'blue-grey darken-4 white-text' : 'blue-grey lighten-2 white-text',
                remove = '';
            if(window.uconfig.roundpb){
                rpb = "circle"
            }
            if(window.uconfig.minimal){
                minimal = 'minimal';
            }
            if (object.original.retweeted_status === undefined && object.original.quoted_status === undefined) {
                content = '<p>' + object.tweet + '</p>'+object.medialink;
                if(object.original.user.screen_name == cDeck.user.screen_name){
                    remove = '<a target="_blank" id="delete" href="#"><i class="material-icons">delete</i></a>'
                }
            } else if (object.original.quoted_status === undefined) {
                content = '<blockquote><div class="card '+colormode+' z-depth-3 tweet" id="tweet-' + object.original.retweeted_status.id_str + '"><div class="card-content"><a target="_blank" href="https://twitter.com/'+object.original.retweeted_status.user.screen_name+'/status/'+object.original.retweeted_status.id_str+'" data-time="'+object.original.retweeted_status.created_at+'" class="chip time waves">' + moment(object.original.retweeted_status.created_at).fromNow() + '</a><span class="card-title left-align"><img src="' + object.original.retweeted_status.user.profile_image_url_https + '" alt="Profilbild" class="'+rpb+' responsive-img">' + object.original.retweeted_status.user.name + '<a target="_blank"id="username" class="grey-text lighten-3" href="https://twitter.com/' + object.original.retweeted_status.user.screen_name + '"> @' + object.original.retweeted_status.user.screen_name + '</a></span><p>' + object.tweet + '</p> '+object.medialink+'</div></blockquote> ';
            } else if (object.original.quoted_status !== undefined) {
                content = '<p>' + object.tweet.main + '</p><blockquote><div class="card '+colormode+' z-depth-3 tweet" id="tweet-' + object.original.quoted_status.id_str + '"><div class="card-content"><a target="_blank" href="https://twitter.com/'+object.original.quoted_status.user.screen_name+'/status/'+object.original.quoted_status.id_str+'" data-time="'+object.original.quoted_status.created_at+'" class="chip time waves">' + moment(object.original.quoted_status.created_at).fromNow() + '</a><span class="card-title left-align"><img src="' + object.original.quoted_status.user.profile_image_url_https + '" alt="Profilbild" class="'+rpb+' responsive-img pb">' + object.original.quoted_status.user.name + '<a target="_blank"id="username" class="grey-text lighten-3" href="https://twitter.com/' + object.original.quoted_status.user.screen_name + '"> @' + object.original.quoted_status.user.screen_name + '</a></span><p>' + object.tweet.sec + '</p>'+object.medialink+'</div></blockquote>';
                if(object.original.user.screen_name == cDeck.user.screen_name){
                    remove = '<a target="_blank" id="delete" href="#"><i class="material-icons">delete</i></a>'
                }
            }
            try {
                html = '<div class="divider"></div><div class="card '+colormode+' tweet '+minimal+'" id="tweet-' + id + '" data-tweet-id="' + id + '" data-mentions="' + object.marray.toString() + '" style="display: none"><div class="card-content"><a target="_blank" href="https://twitter.com/'+object.original.user.screen_name+'/status/'+id+'" data-time="'+object.original.created_at+'" class="chip time waves">' + moment(object.original.created_at).fromNow() + '</a><span class="card-title left-align"><img src="' + object.original.user.profile_image_url_https + '" alt="Profilbild" class="'+rpb+' responsive-img pb">  ' + twemoji.parse(object.original.user.name) + '<a target="_blank"id="username" class="" href="https://twitter.com/' + object.original.user.screen_name + '"> @' + object.original.user.screen_name + '</a></span>' + content + '</div> <div class="card-action"> <a target="_blank"id="reply" data-in-response="' + id + '" href="#"><i class="material-icons">reply</i></a></a><a target="_blank"id="retweet" class="dropdown-button" data-beloworigin="true" data-activates="dropdown-' + id + '" href="#"><i class="material-icons">repeat</i></a><ul id="dropdown-' + id + '" class="dropdown-content"><li><a target="_blank"id="rt" href="#">Retweet</a></li><li><a target="_blank" id="rt_quote" href="#">Quote Tweet</a></li></ul><a target="_blank" id="like" href="#"><i class="material-icons">' + object.fav + '</i></a>'+remove+'</div></div>';
            } catch (e) {
                log.warn('Renderer: '+e);
                html = '<div class="divider"></div><div class="card '+colormode+' tweet '+minimal+'" id="tweet-' + id + '" data-tweet-id="' + id + '" data-mentions="' + object.marray.toString() + '" style="display: none"><div class="card-content"><a target="_blank" href="https://twitter.com/'+object.original.user.screen_name+'/status/'+id+'" data-time="'+object.original.created_at+'" class="chip time waves">' + moment(object.original.created_at).fromNow() + '</a><span class="card-title left-align"><img src="' + object.original.user.profile_image_url_https + '" alt="Profilbild" class="'+rpb+' responsive-img pb">  ' + object.original.user.name + '<a target="_blank"id="username" class="" href="https://twitter.com/' + object.original.user.screen_name + '"> @' + object.original.user.screen_name + '</a></span>' + content + '</div> <div class="card-action"> <a target="_blank"id="reply" data-in-response="' + id + '" href="#"><i class="material-icons">reply</i></a></a><a target="_blank"id="retweet" class="dropdown-button" data-beloworigin="true" data-activates="dropdown-' + id + '" href="#"><i class="material-icons">repeat</i></a><ul id="dropdown-' + id + '" class="dropdown-content"><li><a target="_blank"id="rt" href="#">Retweet</a></li><li><a target="_blank" id="rt_quote" href="#">Quote Tweet</a></li></ul><a target="_blank" id="like" href="#"><i class="material-icons">' + object.fav + '</i></a>'+remove+'</div></div>';
            }
            if($('#timeline').children('.card.tweet').length > 99){
                $('#timeline').children('.card.tweet').last().remove();
                $('#timeline').children('div.divider').last().remove();
            }
            if( extra.action == 'prepend' ){
                if(extra.animate !== undefined && extra.animate == false){
                    $(html).prependTo($('#timeline')).show();
                } else {
                    if($('#timeline').scrollTop() > $('#timeline').children('.card:first').outerHeight(true)){
                        $(html).prependTo($('#timeline')).show();
                        $('#timeline').scrollTop($('#timeline').scrollTop() + $('#tweet-' + id).outerHeight(true) + 1 );
                        if($('#timeline').siblings('h4').find('span.new.badge').length != 0){
                            $('#timeline').siblings('h4').find('span.new.badge').text(parseInt($('#timeline').siblings('h4').find('span.new.badge').text(), 10) + 1)
                        } else {
                            $('<span class="new badge">1</span>').appendTo($('#timeline').siblings('h4'));
                        }
                    } else {
                        $(html).prependTo($('#timeline')).slideDown(300);
                    }
                }
            } else if( extra.action == 'append' ){
                if(extra.animate !== undefined && extra.animate == false){
                    $(html).appendTo($('#timeline')).show();
                } else {
                    if($('#timeline').scrollTop() > $('#timeline').children('.card:first').outerHeight(true)){
                        $(html).appendTo($('#timeline')).show();
                        $('#timeline').scrollTop($('#timeline').scrollTop() + $('#tweet-' + id).outerHeight(true) + 1);

                    } else {
                        $(html).appendTo($('#timeline')).slideDown(300);
                    }
                }
            }
        },
        notification: function( id, extra, object ) {
            var content, rpb = '', minimal = '', html,
                colormode = window.uconfig.colormode == "1" ? 'blue-grey darken-4 white-text' : 'blue-grey lighten-2 white-text',
                type = '';
            if(window.uconfig.roundpb){
                rpb = "circle"
            }
            if(window.uconfig.minimal){
                minimal = 'minimal';
            }
            if (object.original.quoted_status !== undefined) {
                content = '<p>' + object.tweet.main + '</p><blockquote><div class="card '+colormode+' z-depth-3 tweet" id="tweet-' + object.original.quoted_status.id_str + '"><div class="card-content"><span class="card-title left-align"><img src="' + object.original.quoted_status.user.profile_image_url_https + '" alt="Profilbild" class="'+rpb+' responsive-img">' + object.original.quoted_status.user.name + '<a target="_blank"id="username" class="grey-text lighten-3" href="https://twitter.com/' + object.original.quoted_status.user.screen_name + '"> @' + object.original.quoted_status.user.screen_name + '</a></span><p>' + object.tweet.sec + '</p></div></blockquote>';
            } else {
                content = '<p class="noborder">' + object.tweet + '</p>'
            }
            if(object.type === 'follow'){
                try {
                    html = '<div class="divider"></div><div class="card '+colormode+'" style="display: none"><div class="card-content"><div style="float: left;"><i class="material-icons">person_add</i></div><img src="' + object.source.profile_image_url_https + '" alt="Profilbild" class="'+rpb+' responsive-img">  ' + twemoji.parse(object.source.name) + '<a target="_blank"id="username" class="" href="https://twitter.com/' + object.source.screen_name + '">  @' + object.source.screen_name + '</a> '+lang.external[object.type]+' <br> </div> </div>';
                } catch (e) {
                    log.warn('Renderer: '+e);
                    html = '<div class="divider"></div><div class="card '+colormode+'" style="display: none"><div class="card-content"><div style="float: left;"><i class="material-icons">person_add</i></div><img src="' + object.source.profile_image_url_https + '" alt="Profilbild" class="'+rpb+' responsive-img">  ' + object.source.name + '<a target="_blank"id="username" class="" href="https://twitter.com/' + object.source.screen_name + '">  @' + object.source.screen_name + '</a> '+lang.external[object.type]+' <br> </div> </div>';
                }
            } else {
                switch(object.type){
                    case 'like':
                        type = 'favorite';
                        break;
                    case 'retweet':
                        type = 'repeat';
                        break;
                }
                try {
                    if (object.type == 'mention'){
                        html = '<div class="divider"></div><div class="card '+colormode+' '+minimal+'" style="display: none"><div class="card-content"><div style="float: left;"><i class="material-icons">reply</i></div><img src="' + object.source.profile_image_url_https + '" alt="Profilbild" class="'+rpb+' responsive-img">  ' + twemoji.parse(object.source.name) + '<a target="_blank"id="username" class="" href="https://twitter.com/' + object.source.screen_name + '">  @' + object.source.screen_name + '</a> '+lang.external[object.type]+' <br><blockquote>' + content + '</blockquote> </div> </div>';
                    } else {
                        html = '<div class="divider"></div><div class="card '+colormode+' '+minimal+'" style="display: none"><div class="card-content"><div style="float: left;"><i class="material-icons">'+type+'</i></div><img src="' + object.source.profile_image_url_https + '" alt="Profilbild" class="'+rpb+' responsive-img">  ' + twemoji.parse(object.source.name) + '<a target="_blank"id="username" class="3" href="https://twitter.com/' + object.source.screen_name + '">  @' + object.source.screen_name + '</a> '+lang.external[object.type]+' <br><blockquote><div class="card '+colormode+' z-depth-3 tweet"><div class="card-content"><span class="card-title left-align"><img src="' + object.target.user.profile_image_url_https + '" alt="Profilbild" class="'+rpb+' responsive-img">' + object.target.user.name + '<a target="_blank"id="username" class="grey-text lighten-3" href="https://twitter.com/' + object.target.user.screen_name + '"> @' + object.target.user.screen_name + '</a></span>' + content + '</div></blockquote> </div> </div>';
                    }
                } catch (e) {
                    log.warn('Renderer: '+e);
                    if (object.type == 'mention'){
                        html = '<div class="divider"></div><div class="card '+colormode+' '+minimal+'" style="display: none"><div class="card-content"><div style="float: left;"><i class="material-icons">reply</i></div><img src="' + object.source.profile_image_url_https + '" alt="Profilbild" class="'+rpb+' responsive-img">  ' + object.source.name + '<a target="_blank"id="username" class="" href="https://twitter.com/' + object.source.screen_name + '">  @' + object.source.screen_name + '</a> '+lang.external[object.type]+' <br><blockquote>' + content + '</blockquote> </div> </div>';
                    } else {
                        html = '<div class="divider"></div><div class="card '+colormode+' '+minimal+'" style="display: none"><div class="card-content"><div style="float: left;"><i class="material-icons">'+type+'</i></div><img src="' + object.source.profile_image_url_https + '" alt="Profilbild" class="'+rpb+' responsive-img">  ' + object.source.name + '<a target="_blank"id="username" class="" href="https://twitter.com/' + object.source.screen_name + '">  @' + object.source.screen_name + '</a> '+lang.external[object.type]+' <br><blockquote><div class="card '+colormode+' z-depth-3 tweet"><div class="card-content"><span class="card-title left-align"><img src="' + object.target.user.profile_image_url_https + '" alt="Profilbild" class="'+rpb+' responsive-img">' + object.target.user.name + '<a target="_blank"id="username" class="grey-text lighten-3" href="https://twitter.com/' + object.target.user.screen_name + '"> @' + object.target.user.screen_name + '</a></span>' + content + '</div></blockquote> </div> </div>';
                    }
                }
            }
            if( extra.action == 'prepend' ){
                if(extra.animate !== undefined && extra.animate == false){
                    $(html).prependTo($('#notifications')).show();
                } else {
                    if($('#notifications').scrollTop() > $('#notifications').children('.card:first').outerHeight(true)){
                        $(html).prependTo($('#notifications')).show();
                        $('#notifications').scrollTop($('#notifications').scrollTop() + $('#notifications div.card:first').outerHeight(true) + 1 );
                        if($('#notifications').siblings('h4').find('span.new.badge').length !== 0){
                            $('#notifications').siblings('h4').find('span.new.badge').text(parseInt($('#notifications').siblings('h4').find('span.new.badge').text(), 10) + 1)
                        } else {
                            $('<span class="new badge">1</span>').appendTo($('#notifications').siblings('h4'));
                        }
                    } else {
                        $(html).prependTo($('#notifications')).slideDown(300);
                    }
                }
            } else if( extra.action == 'append' ){
                if(extra.animate !== undefined && extra.animate == false){
                    $(html).appendTo($('#notifications')).show();
                } else {
                    if($('#notifications').scrollTop() > $('#notifications').children('.card:first').outerHeight(true)){
                        $(html).appendTo($('#notifications')).show();
                        $('#notifications').scrollTop($('#notifications').scrollTop() + $('#notifications div.card:first').outerHeight(true) + 1);
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
            if($('#tweet-' + data.id_str+' #delete').length !== 0){
                $('#delete').on('click', function (event){
                    event.preventDefault();
                    cDeck.removeTweet(data.id_str);
                });
            }
            $('#tweet-' + data.id_str+' a#username').click(function(e){
                e.preventDefault();
                self.userInfo(($(this).attr('href')).replace('https://twitter.com/', ''));
            });
            $('#tweet-' + data.id_str+' a.username').each(function(){
                $(this).click(function(e){
                    e.preventDefault();
                    self.userInfo(($(this).attr('href')).replace('https://twitter.com/', ''));
                });
            });
            $('.dropdown-button').dropdown();
            $('.slider').slider({full_width: true,indicators: false});
        } else if ( data.delete !== undefined ) {
            $( '#tweet-' + data.delete.status.id_str ).remove();
        } else if ( (data.event == 'favorite' || data.event == 'user-related' || data.event == 'follow')) {
            if(( ( data.object !== undefined && data.object.screen_name !== cDeck.user.screen_name) || (data.source !== undefined && data.source.screen_name !== cDeck.user.screen_name) ) ){
                finalTweet = this.helper.favoriteContent( data );
                this.templater.notification( data.id_str, extra, finalTweet );
                $('#notifications a#username').first().click(function(e){
                    e.preventDefault();
                    self.userInfo(($(this).attr('href')).replace('https://twitter.com/', ''));
                });
                $('#notifications div.card:first a.username').each(function(){
                    $(this).click(function(e){
                        e.preventDefault();
                        self.userInfo(($(this).attr('href')).replace('https://twitter.com/', ''));
                    });
                });
                if($app.state == "ready" && window.uconfig.notifications == "true" && !windowIsVisible()){
                    log.debug('Renderer: Spawning notification');
                    if (!("Notification" in window)) {
                        alert("This browser does not support desktop notification");
                    }
                    else if (Notification.permission === "granted") {
                        var notification = new Notification('cDeck', {
                            body: '@'+finalTweet.source.screen_name + ' '+lang.external[finalTweet.type],
                            icon: finalTweet.source.profile_image_url_https
                        });
                        $('#notification')[0].play();
                    }
                    else if (Notification.permission !== 'denied') {
                        Notification.requestPermission(function (permission) {
                            if (permission === "granted") {
                                changeUconfig({notifications: true}, function(result){
                                    if(result === true){
                                        log.info('Client: Notifications enabled');
                                        Materialize.toast(lang.menu.noti_enabled, 5000)
                                    }
                                });
                                var notification = new Notification('cDeck', {
                                    body: '@'+finalTweet.source.screen_name + ' '+lang.external[finalTweet.type],
                                    icon: finalTweet.source.profile_image_url_https
                                });
                                $('#notification')[0].play();
                            }
                        });
                    }

                }
            }
        } else if( data.event = 'dm' && data.direct_message !== undefined){
            var dm = this.helper.sortDM(data.direct_message);
            if($('.dm-container').length !== 0 && $('.dm-user[data-handle="'+dm.user.screen_name+'"]').hasClass('active')){
                var object = renderer.helper.linkAll({text: dm.message, entities: dm.entities, extended_entities: dm.entities, user: dm.user}),
                    html = '<div class="message"><div class="grey darken-2 '+dm.align+'">'+object.tweet + object.medialink+'</div></div>';
                $(html).appendTo('#dm-msg');
                $('#dm-msg').animate({scrollTop: $('#dm-msg')[0].scrollHeight}, 1000, 'swing');
                $('#dm-msg .materialboxed').materialbox();
            } else {
                if($('.dm-container').length !== 0 && dm.align == 'left'){
                    if($('.dm-user[data-handle="'+dm.user.screen_name+'"] span.new.badge').length == 0){
                        $('<span class="new badge" style="right:unset">0</span>').appendTo('.dm-user[data-handle="'+dm.user.screen_name+'"]');
                    }
                    var badge = $('.dm-user[data-handle="'+dm.user.screen_name+'"] span.new.badge');
                    badge.text(parseInt(badge.text())+1);
                    sendNotification();
                } else if (dm.align == 'left') {
                    sendNotification();
                }
            }
            function sendNotification(){
                if($app.state == "ready" && window.uconfig.notifications == "true"){
                    log.debug('Renderer: Spawning notification');
                    if (!("Notification" in window)) {
                        alert("This browser does not support desktop notification");
                    }
                    else if (Notification.permission === "granted") {
                        var notification = new Notification('cDeck', {
                            body: 'New DM from @'+dm.user.screen_name,
                            icon: dm.user.profile_image_url_https
                        });
                        $('#notification')[0].play();
                    }
                    else if (Notification.permission !== 'denied') {
                        Notification.requestPermission(function (permission) {
                            if (permission === "granted") {
                                changeUconfig({notifications: true}, function(result){
                                    if(result === true){
                                        log.info('Client: Notifications enabled');
                                        Materialize.toast(lang.menu.noti_enabled, 5000)
                                    }
                                });
                                var notification = new Notification('cDeck', {
                                    body: 'New DM from @'+data.user.screen_name,
                                    icon: dm.user.profile_image_url_https
                                });
                                $('#notification')[0].play();
                            }
                        });
                    }

                }
            }
        }
    };

    Renderer.prototype.userInfo = function( handle ){
        if(handle === undefined){
            log.debug('Api: Failed to get user info: No handle given');
            return false;
        }
        var modalNumber = spawnModal(),
            colormode = uconfig.colormode == "1" ? 'grey darken-4 white-text' : '',
            rpb = '',
            btn_follow = '<button class="btn waves-effect waves-light blue" id="follow" data-following="false" data-handle="'+handle+'">Follow</button>',
            icons = '';
        if (window.uconfig.roundpb) {
            rpb = "circle"
        }
        $('#modal' + modalNumber + ' .modal-content').html('<div class="valign-wrapper z-depth-2" style="height:250px;background-color: grey"><div class="preloader-wrapper big active"> <div class="spinner-layer spinner-blue"> <div class="circle-clipper left"> <div class="circle"></div> </div> <div class="gap-patch"> <div class="circle"></div> </div> <div class="circle-clipper right"> <div class="circle"></div> </div> </div> <div class="spinner-layer spinner-red"> <div class="circle-clipper left"> <div class="circle"></div> </div> <div class="gap-patch"> <div class="circle"></div> </div> <div class="circle-clipper right"> <div class="circle"></div> </div> </div> <div class="spinner-layer spinner-yellow"> <div class="circle-clipper left"> <div class="circle"></div> </div> <div class="gap-patch"> <div class="circle"></div> </div> <div class="circle-clipper right"> <div class="circle"></div> </div> </div> <div class="spinner-layer spinner-green"> <div class="circle-clipper left"> <div class="circle"></div> </div> <div class="gap-patch"> <div class="circle"></div> </div> <div class="circle-clipper right"> <div class="circle"></div> </div> </div> </div></div>');
        $('#modal' + modalNumber).css({backgroundColor: 'transparent', boxShadow: 'none'}).removeClass('grey darken-3').openModal({
            dismissible: true,
            opacity: .5,
            complete: function () {
                $('#modal' + modalNumber).remove()
            }
        });
        cDeck.getUserInfo(handle, function(data) {
            if(data.failed !== undefined && data.failed == true && handle == 'api'){
                if(handle == 'api'){
                    data = {
                        "profile_sidebar_fill_color": "DDEEF6",
                        "profile_sidebar_border_color": "C0DEED",
                        "profile_background_tile": false,
                        "name": "cDek API Test",
                        "profile_image_url": "/assets/img/logo.png",
                        "created_at": "Wed May 23 06:01:13 +0000 2007",
                        "location": "",
                        "follow_request_sent": false,
                        "profile_link_color": "0084B4",
                        "is_translator": false,
                        "id_str": "6253282",
                        "entities": {
                            "url": {
                                "urls": []
                            },
                            "description": {
                                "urls": []
                            }
                        },
                        "profile_image_url_https": "/assets/img/logo.png",
                        "profile_banner_url": "/assets/img/bg.png",
                        "utc_offset": -28800,
                        "id": 6253282,
                        "profile_use_background_image": true,
                        "listed_count": 10774,
                        "profile_text_color": "333333",
                        "lang": "en",
                        "followers_count": 1212963,
                        "protected": false,
                        "notifications": null,
                        "profile_background_image_url_https": "https://si0.twimg.com/images/themes/theme1/bg.png",
                        "profile_background_color": "C0DEED",
                        "verified": true,
                        "geo_enabled": true,
                        "time_zone": "Pacific Time (US & Canada)",
                        "description": "cDeck API Debug Test",
                        "default_profile_image": false,
                        "profile_background_image_url": "http://a0.twimg.com/images/themes/theme1/bg.png",
                        "statuses_count": 3333,
                        "friends_count": 31,
                        "following": true,
                        "show_all_inline_media": false,
                        "screen_name": "api"
                    };
                } else {
                    log.warn('Renderer: Getting user info failed: '+data.reason);
                    Materialize.toast('Couldn\'t get user info: '+data.reason, 2000);
                    return $('.lean-overlay').last().trigger('click');
                }
            }
            if(data.following == true){
                btn_follow = '<button class="btn waves-effect waves-light white black-text" id="follow" data-following="true" data-handle="'+handle+'">Following</button>';
            }
            if(data.protected == true){
                icons = icons + '<i class="material-icons">lock</i>'
            }
            if(data.verified == true){
                icons = icons + '<i class="material-icons">check_circle</i>'
            }
            $('#modal' + modalNumber + ' .modal-content').html('<div class="valign-wrapper z-depth-2" style="background: url(\'' + data.profile_banner_url + '\') no-repeat center center;background-size: cover;"><div class="container" style="background-color:'+hexToRgbA('#'+data.profile_link_color, 0.5)+';height:100%;padding: 0 1rem;"><div class="valign"><br><h4 id="modal-header"><img src="' + data.profile_image_url_https + '" alt="Profilbild" class="' + rpb + ' responsive-img pb">  ' + data.name + icons + '</h4><p><a target="_blank"id="username" href="https://twitter.com/' + data.screen_name + '"> @' + data.screen_name + '</a></p><p>' + twttr.txt.autoLink(data.description, {urlEntities: data.entities.description.urls}).replace(/(?:@<(?:[^>]+)>)([^<]+)(?:[^>]+>)/g, '<a target="_blank" class="username" href="https://twitter.com/$1">@$1</a>') + '</p><div class="divider"></div><br><div class="row"><a target="_blank" class="white-text" href="https://twitter.com/' + data.screen_name + '"><div class="col s2 right-border"><p><b>'+data.statuses_count+'</b><br>Tweets</p></div></a><a target="_blank" class="white-text" href="https://twitter.com/' + data.screen_name + '/following"><div class="col s2 right-border"><p><b>'+data.friends_count+'</b><br>Following</p></div></a><a target="_blank" class="white-text" href="https://twitter.com/' + data.screen_name + '/followers"><div class="col s2 right-border"><p><b>' + data.followers_count + '</b><br>Follower</p></div></a><a target="_blank" class="white-text" href="https://twitter.com/' + data.screen_name + '/memberships"><div class="col s2"><p><b>'+data.listed_count+'</b><br>Listed</p></div></a><div class="col s4">'+btn_follow+'</div></div></div></div></div>')
            $('#modal' + modalNumber + ' .modal-content button#follow').on('click', function(){
                var button = $(this), handle = button.attr('data-handle');
                button.html('Loading...');
                function afterClick(type, data){
                    if(typeof data.failed == "undefined"){
                        switch(type){
                            case 0:
                                button.removeClass('blue').addClass('white black-text');
                                button.attr('data-following', 'true');
                                button.html('Following');
                                log.debug('Successfully followed '+handle);
                                break;
                            case 1:
                                button.removeClass('white black-text').addClass('blue');
                                button.attr('data-following', 'false');
                                button.html('Follow');
                                log.debug('Successfully unfollowed '+handle);
                                break;
                        }
                    }
                }
                if($(this).attr('data-following') == "true"){
                    log.debug('Client: Unfollowing '+handle);
                    cDeck.friendship(1, handle, afterClick)
                } else {
                    log.debug('Client: Following '+handle);
                    cDeck.friendship(0, handle, afterClick)
                }
            });
            $('#modal' + modalNumber + ' a.username').each(function(){
                $(this).click(function(e){
                    e.preventDefault();
                    self.userInfo(($(this).attr('href')).replace('https://twitter.com/', ''));
                });
            });
        })
    };

    Renderer.prototype.newTweet = function (type, data) {
        var modalNumber = spawnModal(),
            beforeContent = '',
            tweet = $('#tweet-' + data),
            formExtra = '',
            prefill = '',
            tlength = 140,
            marray = '',
            colormode = uconfig.colormode == "1" ? 'grey darken-3 white-text' : '';
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
            beforeContent = '<blockquote><div id="voice-preview"></div><div class="controls center-align col s12"> <a id="play" class="btn waves-effect"><i class="material-icons">play_arrow</i>/<i class="material-icons">pause</i></a> <a id="stop" class="btn waves-effect"><i class="material-icons">stop</i></a> </div></blockquote>';
            tlength = (tlength - 2) - tconfig.short_url_length_https
        }
        $('#modal' + modalNumber + '-content').html('<div class="row z-depth-2" style="padding:1rem;" id="image-holder"></div>'+beforeContent + '<div class="row"> <form class="col s12 ajax-form"> <div class="row"> <div class="input-field col s12">' + formExtra + '<textarea id="text" class="materialize-textarea" length="'+tlength+'" name="status"></textarea><label for="text">'+lang.external.tweet_something+'</label> </div><button class="btn waves-effect waves-light blue" type="submit">'+lang.external.tweet+'<i class="material-icons right">send</i> </button> </div> </form> </div>');
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
                window.$tweetFile = [];
                window.$voiceblob = undefined;
                $('#modal' + modalNumber).remove()
            }
        });
        if($tweetFile.length > 0){
            $tweetFile.forEach(function(file, index){
                var html = '<div class="col s3" id="media-'+index+'"><div style="display:none;height:100%;width:100%;position:fixed;background-color:rgba(0,0,0,0.6);border-radius: 10%;" class="valign-wrapper" id="iloader"><div class="progress"><div class="determinate" style="width: 0"></div></div></div> ';
                if(file.type === 'image'  || file.type === 'gif'){
                    html += '<img id="tweetMedia" class="responsive-img" src="'+URL.createObjectURL(file.file)+'"></div>'
                } else if(file.type === 'video'){
                    html += '<video id="tweetMedia" class="responsive-video" controls><source src="'+URL.createObjectURL(file.file)+'" type="'+file.file.type+'"></video></div>'
                }
                $(html).appendTo('#image-holder');
            });
        } else {
            $('#image-holder').hide();
        }
        $('#modal' + modalNumber + ' form').submit(function (event) {
            event.preventDefault();
            event.stopPropagation();
            if(($tweetFile.length == 0 && typeof $voiceblob == 'undefined' && $(this).find('textarea').val() == ''))return Materialize.toast('Empty tweet', 3000);
            var modalNumber2 = spawnModal();
            var modal = $('#modal' + modalNumber2);
            modal.addClass('bottom-sheet');
            if($tweetFile.length > 0){
                var media_ids = [],
                    done = 0;
                $tweetFile.forEach(function(file, index) {
                    var data = new FormData();
                    data.append('type', file.file.type);
                    data.append('data', file.file);
                    $('#media-'+index+' #iloader').css({height: $('#media-'+index+' #tweetMedia').height(), width: $('#media-'+index+' #tweetMedia').width()}).fadeIn();
                    $.post({
                        url: '/api/twitter/upload',
                        data: data,
                        dataType: 'json',
                        processData: false,
                        contentType: false,
                        success: function (e) {
                            done++;
                            if(e.response === true){
                                var currentID = e.data.media_id_string;
                                media_ids.push(currentID);
                                if(done === $tweetFile.length) {
                                    modal.openModal({
                                        dismissible: true, ready: function () {
                                            $('#modal' + modalNumber2 + '-content').text(lang.external.one_moment);
                                            $('#preloader' + modalNumber2).show();
                                        }, complete: function () {
                                            modal.remove();
                                        }
                                    });
                                    var extra =  (type !== undefined && type == 'quote') ? (' %0D%0A' + $('#tweet-' + data + ' .card-title #username').attr('href') + '/status/' + data) : '';
                                    var tweet = {status: $('#modal' + modalNumber + ' form').find('textarea').val(), media_ids: media_ids.join(",")};
                                    if($('#modal' + modalNumber + ' form input[name="in_reply_to_status_id"]'))tweet.in_reply_to_status_id = $('#modal' + modalNumber + ' form input[name="in_reply_to_status_id"]').val();
                                    if(e.is_pending === true){
                                        $('#modal' + modalNumber2 + '-content').text('Conversion pending');
                                        var sLoop = setInterval(function(){
                                            $.get({
                                                url: '/api/twitter/upload/status?id='+currentID,
                                                dataType: 'json',
                                                success: function(e) {
                                                    if(e.response === true){
                                                        clearInterval(sLoop);
                                                        $('#modal' + modalNumber2 + '-content').text(lang.external.one_moment);
                                                         $.when(cDeck.postStatus(tweet)).then($('#modal' + modalNumber).closeModal(), modal.closeModal(),  window.$tweetFile = []);
                                                    } else {
                                                    }
                                                },
                                                error: function(e){
                                                    clearInterval(sLoop);
                                                    $('#modal' + modalNumber).closeModal();
                                                    modal.closeModal();
                                                    Materialize.toast('Upload failed', 2000);
                                                    log.error(e);
                                                }
                                            });
                                        }, e.data.processing_info.check_after_secs * 1000);
                                    } else {
                                        $.when(cDeck.postStatus(tweet)).then($('#modal' + modalNumber).closeModal(), modal.closeModal(), window.$tweetFile = []);
                                    }
                                }
                            } else {
                                Materialize.toast('Upload failed', 2000);
                                $('#media-'+index+' #loader').fadeOut(350, function(){
                                    $('#media-'+index+' #loader .indeterminate').width('0%').removeClass('indeterminate').addClass('determinate');
                                });
                            }
                        },
                        error: function(xhr, e){
                            Materialize.toast('Error while uploading media '+(index + 1)+'/'+$tweetFile.length, 2000);
                            log.error(e);
                        },
                        xhr: function() {
                            var xhr = new window.XMLHttpRequest();
                            xhr.upload.addEventListener("progress", function(evt){
                                if (evt.lengthComputable) {
                                    var percentComplete = (evt.loaded / evt.total) * 100;
                                    $('#media-'+index+' #iloader .determinate').width(percentComplete+'%');
                                    if(percentComplete == 100){
                                        $('#media-'+index+' #iloader .determinate').removeClass('determinate').addClass('indeterminate');
                                    }
                                }
                            }, false);
                            return xhr;
                        }
                    });
                });

            } else if (typeof $voiceblob != 'undefined' && type === undefined ){
                modal.openModal({
                    dismissible: false, ready: function () {
                        $('#modal' + modalNumber2 + '-content').text(lang.external.one_moment);
                        $('#preloader' + modalNumber2).show();
                    }, complete: function() {
                        modal.remove();
                    }
                });
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
                                $.when(cDeck.postStatus({status: $('#modal' + modalNumber + ' form').find('textarea').val() + ' ' + e.path})).then($('#modal' + modalNumber).closeModal(), modal.closeModal());
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
                modal.openModal({
                    dismissible: false, ready: function () {
                        $('#modal' + modalNumber2 + '-content').text(lang.external.one_moment);
                        $('#preloader' + modalNumber2).show();
                    }, complete: function() {
                        modal.remove();
                    }
                });
                var extra =  (type !== undefined && type == 'quote') ? ('\n' + $('#tweet-' + data + ' .card-title #username').attr('href') + '/status/' + data) : '';
                var tweet = {status: $(this).find('textarea').val() + extra};
                if($('#modal' + modalNumber + ' form input[name="in_reply_to_status_id"]'))tweet.in_reply_to_status_id = $('#modal' + modalNumber + ' form input[name="in_reply_to_status_id"]').val();
                $.when(cDeck.postStatus(tweet)).then($('#modal' + modalNumber).closeModal(), modal.closeModal());
            }
        });
    };

    // Expose our constructor to the global object
    global.CdeckRenderer = Renderer;

})( this );