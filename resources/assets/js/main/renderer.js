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
        this.socket = upstream;
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
            } else  {
                return data;
            }
        },
        linkText: function( data ){
            var tweet, cvoice, marray = [], fav;
            if ( data.entities !== undefined ) {
                marray[0] = '@' + data.user.screen_name;
                type = self.helper.type(data);
                tweet = type.text;
                type.entities.urls.forEach(function(item){
                    if(item.expanded_url.match(/(?:https:\/\/)?(?:cdeck\.?|dev\.cdeck\.)?(?:skil\.pw?|net)\/(?:voice\/)(.+)/g)){
                        tweet = tweet.replace(item.url, '');
                        cvoice = '<iframe src="'+item.expanded_url+'" height="375px" width="100%" style="border: 0" class="z-depth-2"></iframe>'
                    }else if (uid = item.expanded_url.match(/(?:http:\/\/|https:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v\=)?(.+)/)){
                        tweet = tweet.replace(item.url, '');
                        cvoice = '<div class="video-container z-depth-2"><iframe width="100%" height="315" src="https://www.youtube.com/embed/'+uid[1]+'" frameborder="0" allowfullscreen></iframe></div>'
                    }
                });
                if (data.quoted_status !== undefined) {
                    tweet = {
                        'main': tweet.replace(/(?:https?|http):\/\/[\n\S]+/g, ''),
                        'sec': data.quoted_status.text
                    };
                } else {
                    tweet = twttr.txt.autoLink(type.text, {urlEntities: type.entities.urls});
                }
                if(cvoice !== undefined){
                    if( tweet.sec !== undefined ){
                        tweet.main = tweet.main+cvoice
                    } else {
                        tweet = tweet+cvoice
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
        }
    };

    // Templater. Generates and injects templates into the page.
    // Mainly used to display tweet cards and notification cards.
    Renderer.prototype.templater = {
        timeline: function( id, action, object ) {
            var content;
            if (object.original.retweeted_status === undefined && object.original.quoted_status === undefined) {
                content = '<p>' + object.tweet + '</p>'
            } else if (object.original.quoted_status === undefined) {
                content = '<blockquote><div class="card blue-grey darken-1 white-text z-depth-3 tweet" id="tweet-' + object.original.retweeted_status.id_str + '">' + object.medialink + '<div class="card-content"><span class="card-title left-align"><img src="' + object.original.retweeted_status.user.profile_image_url_https + '" alt="Profilbild" class="circle responsive-img">' + object.original.retweeted_status.user.name + '<a target="_blank"id="username" class="grey-text lighten-3" href="https://twitter.com/' + object.original.retweeted_status.user.screen_name + '"> @' + object.original.retweeted_status.user.screen_name + '</a></span><p>' + object.tweet + '</p> </div></blockquote> ';
                object.medialink = '';
            } else if (object.original.quoted_status !== undefined) {
                content = '<p>' + object.tweet.main + '</p><blockquote><div class="card blue-grey darken-1 white-text z-depth-3 tweet" id="tweet-' + object.original.quoted_status.id_str + '">' + object.medialink + '<div class="card-content"><span class="card-title left-align"><img src="' + object.original.quoted_status.user.profile_image_url_https + '" alt="Profilbild" class="circle responsive-img">' + object.original.quoted_status.user.name + '<a target="_blank"id="username" class="grey-text lighten-3" href="https://twitter.com/' + object.original.quoted_status.user.screen_name + '"> @' + object.original.quoted_status.user.screen_name + '</a></span><p>' + object.tweet.sec + '</p></div></blockquote>';
                object.medialink = '';
            }
            var html = '<div class="divider"></div><div class="card blue-grey darken-1 white-text tweet" id="tweet-' + id + '" data-tweet-id="' + id + '" data-mentions="' + object.marray.toString() + '" style="display: none">' + object.medialink + '<div class="card-content"><span class="card-title left-align"><img src="' + object.original.user.profile_image_url_https + '" alt="Profilbild" class="circle responsive-img">' + object.original.user.name + '<a target="_blank"id="username" class="grey-text lighten-3 " href="https://twitter.com/' + object.original.user.screen_name + '">@' + object.original.user.screen_name + '</a></span>' + content + '</div> <div class="card-action"> <a target="_blank"id="reply" data-in-response="' + id + '" href="#"><i class="material-icons">reply</i></a></a><a target="_blank"id="retweet" class="dropdown-button" data-beloworigin="true" data-activates="dropdown-' + id + '" href="#"><i class="material-icons">repeat</i></a><ul id="dropdown-' + id + '" class="dropdown-content"><li><a target="_blank"id="rt" href="#">Retweet</a></li><li><a target="_blank" id="rt_quote" href="#">Quote Tweet</a></li></ul><a target="_blank" id="like" href="#"><i class="material-icons">' + object.fav + '</i></div></div>';
            if( action == 'prepend' ){
                $(html).prependTo($('#timeline')).slideDown(300);
            } else if( action == 'append' ){
                $(html).appendTo($('#timeline')).slideDown(300);
            }
        }
    };

    // Function to display a Tweet
    Renderer.prototype.display = function ( data, socket, action ) {
        if( action === undefined ){
            action = 'prepend';
        }
        this.socket = socket;
        if ( data.text !== undefined ) {
            var finalTweet = this.helper.linkAll( data );
            this.templater.timeline(data.id_str, action, finalTweet);
            $('#tweet-' + data.id_str + ' .materialboxed').materialbox();
            $('#reply').on('click', function (event) {
                event.preventDefault();
                self.newTweet($(this), socket);
            });
            $('#like').on('click', function (event) {
                event.preventDefault();
                socket.postLike(data.id_str);
            });
            $('#rt').on('click', function (event) {
                event.preventDefault();
                self.newRt(data.id_str, false, socket);
            });
            $('#rt_quote').on('click', function (event) {
                event.preventDefault();
                self.newRt(data.id_str, true, socket);
            });
            $('.dropdown-button').dropdown();
            $('.slider').slider({full_width: true,indicators: false});
        }
    };

    // Expose our constructor to the global object
    global.CdeckRenderer = Renderer;

})( this );