var cDeck = function () {
    this.host = 'https://' + window.location.hostname;
    this.renderer = new Renderer();
    this.user = Object;
},
    errmsg = [
        'Da ist was schief gelaufen...',
        'So war das nicht geplant...',
        'Das war wohl nix...',
        'Autsch! Das tat weh...',
        'Nein, so geht das nicht...',
        'Nope. Versuch es doch nochmal?',
        'I can’t let you do that, Starfox!',
        'Try me, bitch!',
        'Sorry, bin gestolpert :(',
        'Ein anderes Mal vielleicht.',
        'Bin zu Müde',
        'Alles die Schuld von @wartemalchris',
        'Nice try'
    ],
    tconfig = {},
    uconfig = {},
    lang = {};

$.get('/api/twitter/tconfig', function (data) {
    if(data !== null) {
        tconfig = data
    }else{
        throw new CDeckError('tconfig is null. Contact server administrator.')
    }

}, 'json');

$.get('/api/uconfig', function (data) {
    if(data !== null) {
        uconfig = data;
        notify.config({pageVisibility: true, autoClose: 7000});
    }else{
        throw new CDeckError('Couldn\'t recieve uconfig')
    }

}, 'json');

if(uconfig.lang !== undefined){
    var ln = uconfig.lang;
}else{
    var ln = $('html').attr('lang');
}

$.get('/api/lang?lang='+ln, function (data) {
    if(data !== null) {
        lang = data;
    }else{
        lang = fallbackLang;
        throw new CDeckError('Couldn\'t get lang file, using fallback')
    }

}, 'json');

function changeUconfig(params){
    var a = {};
    $.post({
        url: '/api/uconfig',
        data: params,
        success: function(data){
            a = data
        },
        dataType: 'json',
        async: false
    });
    return a.response
}

function CDeckError(message) {
    Error.apply(this, arguments);
    this.name = "cDeckError";
    this.message = (message || "Not specified error.");
    Materialize.toast(errmsg[Math.floor(Math.random()*errmsg.length)], 5000);
}
CDeckError.prototype = Object.create(Error.prototype);
cDeck.prototype.connect = function (id) {
    if(id === undefined){
        id = 0;
    }
    var socket = io.connect({path: "/api/upstream", 'force new connection' : true}),
        data = {},
        renderer = this.renderer,
        self = this,
        rShow = 0,
        errorModal = '',
        sizeSet = 0;
    $.ajax({
        url: '/api/twitter/getToken?id='+id,
        async: false,
        dataType: 'json',
        success: function (response) {
            data = response;
        }
    });
    function register() {
        socket.emit('register', data, function (response) {
            if (response == true) {
                Materialize.toast(lang.external.login, 2000);
                $('#timeline').empty();
                $('#notifications').empty();
                $('<div class="preloader-wrapper big active" style="display:none;" id="preloader' + modalCount + '"><div class="spinner-layer spinner-blue"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div><div class="spinner-layer spinner-red"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div><div class="spinner-layer spinner-yellow"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div><div class="spinner-layer spinner-green"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div>').prependTo($('#timeline, #notifications')).slideDown(300);
                sizeSet = 0
            } else {
                if(response.error == "double connect"){
                    console.log("cDeck: Double Connect detected.")
                }else{
                    socket.close();
                    Materialize.toast(lang.external.login_failed+': ' + response.error, 2000);
                    throw new CDeckError("Login failed: " + response.error)
                }
            }
        });
    }
    register();
    this.user = data;
    this.socket = socket;
    this.socket.on('reconnect', function () {
            if (errorModal !== '') {
                $('#modal' + errorModal).closeModal();
                errorModal = ''
            }
            rShow = 0;
            register();
    });
    this.socket.on('timeline', function (data, response) {
        console.log(data);
        var selector = $('#timeline, #notifications').children('.preloader-wrapper');
        if(selector.length > 0){
            selector.each(function(b, a){$(a).remove()});
        }
        if(sizeSet == 0){
            setSize($('.section .row .col .section > div'));
            sizeSet = 1
        }
        data.forEach(function (item) {
            renderer.display(item, self);
            response(true);
        })
    });
    this.socket.on('connect_error', function () {
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
    });
    this.socket.on('reconnecting', function () {
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
    });
    this.socket.on('reconnect_error', function () {
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
    });
    this.socket.on('fatal_error', function(err){
            throw new CDeckError('Server error: '+err);
    });
    return this
};

cDeck.prototype.close = function(){
    this.socket.emit('disconnect', this.user.api_token);
    this.socket.destroy();
    Materialize.toast(lang.external.logout, 2000);
    return this
};

cDeck.prototype.postStatus = function (data, modal) {
    if (this.socket) {
        console.log(data);
        this.socket.emit('postStatus', {user: this.user, tweet: data, api_token: this.user.api_token}, function (response) {
            if (response.result === true) {
                $('#modal' + modal).closeModal();
                if (typeof $voiceblob != 'undefined'){
                    $voiceblob = undefined
                }
            } else {
                $('#modal' + modal).closeModal();
                throw new CDeckError('Update status failed: '+response.twitter.message);
            }
        })
    }
    return this
};
cDeck.prototype.postRt = function (data, modal) {
    if (this.socket) {
        this.socket.emit('postRt', {user: this.user, id: data, api_token: this.user.api_token}, function (response) {
            if (response.result === true) {
                if (modal !== undefined) {
                    $('#modal' + modal).closeModal();
                }
            } else {
                if (modal !== undefined) {
                    $('#modal' + modal).closeModal();
                }
                throw new CDeckError('Retweet failed: '+response.twitter.message);
            }
        })
    }
    return this
};

cDeck.prototype.postLike = function (data) {
    if (this.socket) {
        this.socket.emit('postLike', {user: this.user, id: data, api_token: this.user.api_token}, function (response) {
            if (response.result === true) {
                $('#tweet-' + data + ' #like i').html('favorite');
            } else {
                console.log(response);
                throw new CDeckError('Like failed: '+response.twitter.message);
            }
        })
    }
    return this
};
cDeck.prototype.getTweets = function(max_id) {
    if(max_id === undefined){
        throw new CDeckError('max_id missing')
    }
    var modal = spawnModal();
    $('#modal'+modal+'-content').text(lang.external.loading_more);
    $('#preloader' + modal).show();
    $('#modal'+modal).addClass('bottom-sheet').openModal();
    this.socket.emit('getTweets', {max_id: max_id, api_token: this.user.api_token}, function(response){
        response.forEach(function (item) {
            renderer.display(item, self, 'append');
        });
        $('#modal'+modal).closeModal();
    });
    return this;
};

var Renderer = function (upstream) {
    this.patterns = [];
    this.patterns['mailto'] = '([_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,3}))';
    this.patterns['user'] = ' +@([a-z0-9_]*)?';
    this.patterns['hashtag'] = '(?:(?<=\s)|^)#(\w*[\p{L}-\d\p{Cyrillic}\d]+\w*)';
    this.patterns['long_url'] = '>(([[:alnum:]]+:\/\/)|www\.)?([^[:space:]]{12,22})([^[:space:]]*)([^[:space:]]{12,22})([[:alnum:]#?\/&=])<';
    this.index = {};
    this.socket = upstream;
    this.config = tconfig;
},
    tcount = 0,
    tindex = [];

Renderer.prototype.display = function (data, socket, action) {
    if(action === undefined){
        action = 'prepend'
    }
    var self = this,
        tid = 0,
        fav = '',
        medialink = '',
        mentions = '',
        tweet,
        cvoice,
        marray = [];
    this.socket = socket;
    if (tcount > 100) {
        tindex.slice(Math.max(this.index.length - 10, 1)).forEach(function (item, indx) {
            $('#tweet-' + item[indx]).remove();
        })
    }
    if($('#tweet-'+data.id).length >= 1) {
        return;
    }
    if (data.text !== undefined) {
        tweet = data.text;
        marray[0] = '@'+data.user.screen_name;
        if (data.entities !== undefined) {
            if (data.retweeted_status === undefined && data.quoted_status === undefined) {
                data.entities.urls.forEach(function(item){
                    if(item.expanded_url.match(/(?:https:\/\/)?(?:cdeck\.?|dev\.cdeck\.)?(?:skil\.pw?|net)\/(?:voice\/)(.+)/g)){
                        tweet = tweet.replace(item.url, '');
                        cvoice = '<iframe src="'+item.expanded_url+'" height="375px" width="100%" style="border: 0" class="z-depth-2"></iframe>'
                    }else if (uid = item.expanded_url.match(/(?:http:\/\/|https:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v\=)?(.+)/)){
                        tweet = tweet.replace(item.url, '');
                        cvoice = '<div class="video-container z-depth-2"><iframe width="100%" height="315" src="https://www.youtube.com/embed/'+uid[1]+'" frameborder="0" allowfullscreen></iframe></div>'
                    }
                });
                tweet = twttr.txt.autoLink(tweet, {urlEntities: data.entities.urls});
                if(cvoice !== undefined){
                    tweet = tweet+cvoice
                }
                if (data.favorited === true) {
                    fav = 'favorite'
                } else {
                    fav = 'favorite_border'
                }
                data.entities.user_mentions.forEach(function(b, a){
                    marray[a+1] = '@'+b.screen_name
                });
            } else if (data.quoted_status === undefined) {
                tweet = twttr.txt.autoLink(data.retweeted_status.text, {urlEntities: data.retweeted_status.entities.urls});
                if (data.retweeted_status.favorited === true) {
                    fav = 'favorite'
                } else {
                    fav = 'favorite_border'
                }
                data.retweeted_status.entities.user_mentions.forEach(function(b, a){
                    marray[a+1] = '@'+b.screen_name
                })
            } else if (data.quoted_status !== undefined) {
                tweet = {
                    'main': data.text.replace(/(?:https?|http):\/\/[\n\S]+/g, ''),
                    'sec': data.quoted_status.text
                };
                data.quoted_status.entities.urls.forEach(function(item){
                    if(item.expanded_url.match(/(?:https:\/\/)?(?:cdeck\.?|dev\.cdeck\.)?(?:skil\.pw?|net)\/(?:voice\/)(.+)/g)){
                        tweet.sec = tweet.replace(item.url, '');
                        cvoice = '<iframe src="'+item.expanded_url+'" height="375px" width="100%" style="border: 0" class="z-depth-2"></iframe>'                    }
                });
                tweet.sec = twttr.txt.autoLink(tweet.sec, {urlEntities: data.quoted_status.entities.urls});
                if(cvoice !== undefined){
                    tweet.sec = tweet.sec+cvoice
                }
                if (data.favorited === true) {
                    fav = 'favorite'
                } else {
                    fav = 'favorite_border'
                }
                data.entities.user_mentions.forEach(function(b, a){
                    marray[a+1] = '@'+b.screen_name
                })
            }
            if (data.extended_entities !== undefined && data.extended_entities.media !== undefined) {
                if (data.retweeted_status === undefined && data.quoted_status === undefined) {
                    if(data.extended_entities.media[0].type == 'photo'){
                        if(data.extended_entities.media.length > 1){
                            var a = '<div class"card-image"><div class="slider"><ul class="slides">';
                            data.extended_entities.media.forEach(function(item){
                                a = a+'<li><img src="'+item.media_url_https+'" class="materialboxed" data-caption=\'' + tweet.replace(/'/g, "&#039;") + '\'></li>'
                            });
                            medialink = a+'</ul></div></div>'
                        }else {
                            medialink = '<div class="card-image"><img src="' + data.extended_entities.media[0].media_url_https + '" class="materialboxed" data-caption=\'' + tweet.replace(/'/g, "&#039;") + '\'></div>';
                        }
                    }
                } else if (data.quoted_status === undefined) {
                    if(data.retweeted_status.extended_entities.media[0].type == 'photo'){
                        if(data.retweeted_status.extended_entities.media.length > 1){
                            var a = '<div class"card-image"><div class="slider"><ul class="slides">';
                            data.retweeted_status.extended_entities.media.forEach(function(item){
                                a = a+'<li><img src="'+item.media_url_https+'" class="materialboxed" data-caption=\'' + tweet.replace(/'/g, "&#039;") + '\'></li>'
                            });
                            medialink = a+'</ul></div></div>'
                        }else {
                            medialink = '<div class="card-image"><img src="' + data.retweeted_status.extended_entities.media[0].media_url_https + '" class="materialboxed" data-caption=\'' + tweet.replace(/'/g, "&#039;") + '\'></div>';
                        }
                    }
                } else {
                    if(data.quoted_status.extended_entities.media[0].type == 'photo'){
                        if(data.quoted_status.extended_entities.media.length > 1){
                            var a = '<div class"card-image"><div class="slider"><ul class="slides">';
                            data.quoted_status.extended_entities.media.forEach(function(item){
                                a = a+'<li><img src="'+item.media_url_https+'" class="materialboxed" data-caption=\'' + tweet.replace(/'/g, "&#039;") + '\'></li>'
                            });
                            medialink = a+'</ul></div></div>'
                        }else {
                            medialink = '<div class="card-image"><img src="' + data.quoted_status.extended_entities.media[0].media_url_https + '" class="materialboxed" data-caption=\'' + tweet.replace(/'/g, "&#039;") + '\'></div>';
                        }
                    }
                }
            }
            if(data.urls !== undefined){
                if(data.urls.expanded_url.match(/(?:http:\/\/|https:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)(.+)/)){
                    var uid = data.urls.expanded_url.replace(/(?:http:\/\/|https:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)(.+)/, '$1');
                    tweet += '<div class="video-container"><iframe width="560" height="315" src="https://www.youtube.com/embed/'+uid+'" frameborder="0" allowfullscreen></iframe></div>';
                }
            }
        }
        if (data.retweeted_status === undefined && data.quoted_status === undefined) {
            if(action == 'prepend'){
                $('<div class="divider"></div><div class="card blue-grey darken-1 white-text tweet" id="tweet-' + data.id_str + '" data-tweet-id="'+data.id_str+'" data-mentions="'+ marray.toString() +'" style="display: none">' + medialink + '<div class="card-content"><span class="card-title left-align"><img src="' + data.user.profile_image_url_https + '" alt="Profilbild" class="circle responsive-img">' + data.user.name + '<a target="_blank"id="username" class="grey-text lighten-3 " href="https://twitter.com/' + data.user.screen_name + '">@' + data.user.screen_name + '</a></span><p>' + tweet + '</p> </div> <div class="card-action"> <a target="_blank"id="reply" data-in-response="' + data.id_str + '" href="#"><i class="material-icons">reply</i></a></a><a target="_blank"id="retweet" class="dropdown-button" data-beloworigin="true" data-activates="dropdown-' + data.id_str + '" href="#"><i class="material-icons">repeat</i></a><ul id="dropdown-' + data.id_str + '" class="dropdown-content"><li><a target="_blank"id="rt" href="#">Retweet</a></li><li><a target="_blank"id="rt_quote" href="#">Quote Tweet</a></li></ul><a target="_blank"id="like" href="#"><i class="material-icons">' + fav + '</i></div></div>').prependTo($('#timeline')).slideDown(300);
                if($('#timeline').scrollTop() > 200){
                    $('#timeline').scrollTop($('#timeline').scrollTop() + $('#tweet-'+data.id_str).outerHeight());
                }
            }else if(action == 'append'){
                $('<div class="divider"></div><div class="card blue-grey darken-1 white-text tweet" id="tweet-' + data.id_str + '" data-tweet-id="'+data.id_str+'" data-mentions="'+ marray.toString() +'" style="display: none">' + medialink + '<div class="card-content"><span class="card-title left-align"><img src="' + data.user.profile_image_url_https + '" alt="Profilbild" class="circle responsive-img">' + data.user.name + '<a target="_blank"id="username" class="grey-text lighten-3 " href="https://twitter.com/' + data.user.screen_name + '">@' + data.user.screen_name + '</a></span><p>' + tweet + '</p> </div> <div class="card-action"> <a target="_blank"id="reply" data-in-response="' + data.id_str + '" href="#"><i class="material-icons">reply</i></a></a><a target="_blank"id="retweet" class="dropdown-button" data-beloworigin="true" data-activates="dropdown-' + data.id_str + '" href="#"><i class="material-icons">repeat</i></a><ul id="dropdown-' + data.id_str + '" class="dropdown-content"><li><a target="_blank"id="rt" href="#">Retweet</a></li><li><a target="_blank"id="rt_quote" href="#">Quote Tweet</a></li></ul><a target="_blank"id="like" href="#"><i class="material-icons">' + fav + '</i></div></div>').appendTo($('#timeline')).slideDown(300);
            }
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
            tid = data.id_str
        } else if (data.quoted_status === undefined) {
            if(action == 'prepend'){
                $('<div class="divider"></div><div class="card blue-grey darken-1 white-text tweet" id="tweet-' + data.id_str + '" data-tweet-id="'+data.id_str+'" data-mentions="'+ marray.toString() +'" style="display: none"><div class="card-content"><span class="card-title left-align"><img src="' + data.user.profile_image_url_https + '" alt="Profilbild" class="circle responsive-img">' + data.user.name + '<a target="_blank"id="username" class="grey-text lighten-3" href="https://twitter.com/' + data.user.screen_name + '">@' + data.user.screen_name + '</a></span><blockquote><div class="card blue-grey darken-1 white-text z-depth-3 tweet" id="tweet-' + data.retweeted_status.id_str + '">' + medialink + '<div class="card-content"><span class="card-title left-align"><img src="' + data.retweeted_status.user.profile_image_url_https + '" alt="Profilbild" class="circle responsive-img">' + data.retweeted_status.user.name + '<a target="_blank"id="username" class="grey-text lighten-3" href="https://twitter.com/' + data.retweeted_status.user.screen_name + '"> @' + data.retweeted_status.user.screen_name + '</a></span><p>' + tweet + '</p> </div></blockquote> </div> <div class="card-action">  <a target="_blank"id="reply" data-in-response="' + data.retweeted_status.id_str + '" href="#"><i class="material-icons">reply</i></a><a target="_blank"id="retweet" class="dropdown-button" data-beloworigin="true" data-activates="dropdown-' + data.retweeted_status.id_str + '" href="#"><i class="material-icons">repeat</i></a><ul id="dropdown-' + data.retweeted_status.id_str + '" class="dropdown-content"><li><a target="_blank"id="rt" href="#">Retweet</a></li><li><a target="_blank"id="rt_quote" href="#">Quote Tweet</a></li></ul><a target="_blank"id="like" href="#"><i class="material-icons">' + fav + '</i></a></div></div>').prependTo($('#timeline')).slideDown(300);
                if($('#timeline').scrollTop() > 200){
                    $('#timeline').scrollTop($('#timeline').scrollTop() + $('#tweet-'+data.id_str).outerHeight());
                }
            }else if(action == 'append'){
                $('<div class="divider"></div><div class="card blue-grey darken-1 white-text tweet" id="tweet-' + data.id_str + '" data-tweet-id="'+data.id_str+'" data-mentions="'+ marray.toString() +'" style="display: none"><div class="card-content"><span class="card-title left-align"><img src="' + data.user.profile_image_url_https + '" alt="Profilbild" class="circle responsive-img">' + data.user.name + '<a target="_blank"id="username" class="grey-text lighten-3" href="https://twitter.com/' + data.user.screen_name + '">@' + data.user.screen_name + '</a></span><blockquote><div class="card blue-grey darken-1 white-text z-depth-3 tweet" id="tweet-' + data.retweeted_status.id_str + '">' + medialink + '<div class="card-content"><span class="card-title left-align"><img src="' + data.retweeted_status.user.profile_image_url_https + '" alt="Profilbild" class="circle responsive-img">' + data.retweeted_status.user.name + '<a target="_blank"id="username" class="grey-text lighten-3" href="https://twitter.com/' + data.retweeted_status.user.screen_name + '"> @' + data.retweeted_status.user.screen_name + '</a></span><p>' + tweet + '</p> </div></blockquote> </div> <div class="card-action">  <a target="_blank"id="reply" data-in-response="' + data.retweeted_status.id_str + '" href="#"><i class="material-icons">reply</i></a><a target="_blank"id="retweet" class="dropdown-button" data-beloworigin="true" data-activates="dropdown-' + data.retweeted_status.id_str + '" href="#"><i class="material-icons">repeat</i></a><ul id="dropdown-' + data.retweeted_status.id_str + '" class="dropdown-content"><li><a target="_blank"id="rt" href="#">Retweet</a></li><li><a target="_blank"id="rt_quote" href="#">Quote Tweet</a></li></ul><a target="_blank"id="like" href="#"><i class="material-icons">' + fav + '</i></a></div></div>').appendTo($('#timeline')).slideDown(300);
            }
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
                self.newRt(data.retweeted_status.id_str, false, socket);
            });
            $('#rt_quote').on('click', function (event) {
                event.preventDefault();
                self.newRt(data.retweeted_status.id_str, true, socket);
            });
            $('.dropdown-button').dropdown();
            $('.slider').slider({full_width: true,indicators: false});
            tid = data.id_str
        } else if (data.quoted_status !== undefined) {
            if(action == 'prepend'){
                $('<div class="divider"></div><div class="card blue-grey darken-1 white-text tweet" id="tweet-' + data.id_str + '" data-tweet-id="'+data.id_str+'" data-mentions="'+ marray.toString() +'" style="display: none"><div class="card-content"><span class="card-title left-align"><img src="' + data.user.profile_image_url_https + '" alt="Profilbild" class="circle responsive-img">' + data.user.name + '<a target="_blank"id="username" class="grey-text lighten-3" href="https://twitter.com/' + data.user.screen_name + '">@' + data.user.screen_name + '</a></span><p>' + tweet.main + '</p><blockquote><div class="card blue-grey darken-1 white-text z-depth-3 tweet" id="tweet-' + data.quoted_status.id_str + '">' + medialink + '<div class="card-content"><span class="card-title left-align"><img src="' + data.quoted_status.user.profile_image_url_https + '" alt="Profilbild" class="circle responsive-img">' + data.quoted_status.user.name + '<a target="_blank"id="username" class="grey-text lighten-3" href="https://twitter.com/' + data.quoted_status.user.screen_name + '"> @' + data.quoted_status.user.screen_name + '</a></span><p>' + tweet.sec + '</p></div></blockquote> </div> <div class="card-action">  <a target="_blank"id="reply" data-in-response="' + data.id_str + '" href="#"><i class="material-icons">reply</i></a><a target="_blank"id="retweet" class="dropdown-button" data-beloworigin="true" data-activates="dropdown-' + data.id_str + '" href="#"><i class="material-icons">repeat</i></a><ul id="dropdown-' + data.id_str + '" class="dropdown-content"><li><a target="_blank"id="rt" href="#">Retweet</a></li><li><a target="_blank"id="rt_quote" href="#">Quote Tweet</a></li></ul><a target="_blank"id="like" href="#"><i class="material-icons">' + fav + '</i></a></div></div>').prependTo($('#timeline')).slideDown(300);
                if($('#timeline').scrollTop() > 200){
                    $('#timeline').scrollTop($('#timeline').scrollTop() + $('#tweet-'+data.id_str).outerHeight());
                }
            }else if(action == 'append'){
                $('<div class="divider"></div><div class="card blue-grey darken-1 white-text tweet" id="tweet-' + data.id_str + '" data-tweet-id="'+data.id_str+'" data-mentions="'+ marray.toString() +'" style="display: none"><div class="card-content"><span class="card-title left-align"><img src="' + data.user.profile_image_url_https + '" alt="Profilbild" class="circle responsive-img">' + data.user.name + '<a target="_blank"id="username" class="grey-text lighten-3" href="https://twitter.com/' + data.user.screen_name + '">@' + data.user.screen_name + '</a></span><p>' + tweet.main + '</p><blockquote><div class="card blue-grey darken-1 white-text z-depth-3 tweet" id="tweet-' + data.quoted_status.id_str + '">' + medialink + '<div class="card-content"><span class="card-title left-align"><img src="' + data.quoted_status.user.profile_image_url_https + '" alt="Profilbild" class="circle responsive-img">' + data.quoted_status.user.name + '<a target="_blank"id="username" class="grey-text lighten-3" href="https://twitter.com/' + data.quoted_status.user.screen_name + '"> @' + data.quoted_status.user.screen_name + '</a></span><p>' + tweet.sec + '</p></div></blockquote> </div> <div class="card-action">  <a target="_blank"id="reply" data-in-response="' + data.id_str + '" href="#"><i class="material-icons">reply</i></a><a target="_blank"id="retweet" class="dropdown-button" data-beloworigin="true" data-activates="dropdown-' + data.id_str + '" href="#"><i class="material-icons">repeat</i></a><ul id="dropdown-' + data.id_str + '" class="dropdown-content"><li><a target="_blank"id="rt" href="#">Retweet</a></li><li><a target="_blank"id="rt_quote" href="#">Quote Tweet</a></li></ul><a target="_blank"id="like" href="#"><i class="material-icons">' + fav + '</i></a></div></div>').prependTo($('#timeline')).slideDown(300);
            }
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
            tid = data.id_str
        }
        tcount++;
        tindex[tcount] = tid;
    } else if (data.delete !== undefined) {
        $('#tweet-' + data.delete.status.id_str).remove();
    } else if (data.event == 'favorite') {
        if (data.source.screen_name != socket.user.screen_name) {
            tweet = twttr.txt.autoLink(data.target_object.text, {urlEntities: data.target_object.entities.urls});
            if(action == 'prepend'){
                $('<div class="divider"></div><div class="card blue-grey darken-1 white-text" style="display: none"><div class="card-content"><img src="' + data.source.profile_image_url_https + '" alt="Profilbild" class="circle responsive-img">' + data.source.name + '<a target="_blank"id="username" class="grey-text lighten-3" href="https://twitter.com/' + data.source.screen_name + '"> @' + data.source.screen_name + '</a> liked <br><blockquote><div class="card blue-grey darken-1 white-text z-depth-3 tweet" id="tweet-' + data.target_object.id_str + '"><div class="card-content"><span class="card-title left-align"><img src="' + data.target_object.user.profile_image_url_https + '" alt="Profilbild" class="circle responsive-img">' + data.target_object.user.name + '<a target="_blank"id="username" class="grey-text lighten-3" href="https://twitter.com/' + data.target_object.user.screen_name + '"> @' + data.target_object.user.screen_name + '</a></span><p>' + tweet + '</p> </div></blockquote> </div> </div>').prependTo($('#notifications')).slideDown(300);
            }else if(action == 'append'){
                $('<div class="divider"></div><div class="card blue-grey darken-1 white-text" style="display: none"><div class="card-content"><img src="' + data.source.profile_image_url_https + '" alt="Profilbild" class="circle responsive-img">' + data.source.name + '<a target="_blank"id="username" class="grey-text lighten-3" href="https://twitter.com/' + data.source.screen_name + '"> @' + data.source.screen_name + '</a> liked <br><blockquote><div class="card blue-grey darken-1 white-text z-depth-3 tweet" id="tweet-' + data.target_object.id_str + '"><div class="card-content"><span class="card-title left-align"><img src="' + data.target_object.user.profile_image_url_https + '" alt="Profilbild" class="circle responsive-img">' + data.target_object.user.name + '<a target="_blank"id="username" class="grey-text lighten-3" href="https://twitter.com/' + data.target_object.user.screen_name + '"> @' + data.target_object.user.screen_name + '</a></span><p>' + tweet + '</p> </div></blockquote> </div> </div>').prependTo($('#notifications')).slideDown(300);
            }
            if(uconfig.notifications == "true"){
                notify.createNotification("cDeck", {body: "@"+data.source.screen_name+" "+lang.external.liked, icon: "/assets/img/logo.png"})
            }
        } else {
            $('#tweet-' + data.target_object.id_str + ' #like i').html('favorite');
        }
    } else if (data.event == 'user-related'){
        tweet = data.object.text;
        if (data.object.entities !== undefined) {
            if (data.object.retweeted_status === undefined && data.object.quoted_status === undefined) {
                tweet = twttr.txt.autoLink(tweet, {urlEntities: data.object.entities.urls});
            } else if (data.object.quoted_status === undefined) {
                tweet = twttr.txt.autoLink(data.object.retweeted_status.text, {urlEntities: data.object.retweeted_status.entities.urls});
            } else if (data.object.quoted_status !== undefined) {
                tweet = {
                    'main': data.object.text.replace(/(?:https?|http):\/\/[\n\S]+/g, ''),
                    'sec': twttr.txt.autoLink(data.object.quoted_status.text, {urlEntities: data.object.quoted_status.entities.urls})
                };
            }
            if (data.object.entities.media !== undefined) {
                if (data.object.retweeted_status === undefined && data.object.quoted_status === undefined) {
                    medialink = '<div class="card-image"><img src="' + data.object.entities.media[0].media_url_https + '" class="materialboxed" data-caption=\'' + tweet.replace(/'/g, "&#039;") + '\'></div>';
                } else if (data.object.quoted_status === undefined) {
                    medialink = '<div class="card-image"><img src="' + data.object.retweeted_status.entities.media[0].media_url_https + '" class="materialboxed" data-caption=\'' + tweet.replace(/'/g, "&#039;") + '\'></div>';
                } else {
                    medialink = '<div class="card-image"><img src="' + data.object.quoted_status.entities.media[0].media_url_https + '" class="materialboxed" data-caption=\'' + tweet.replace(/'/g, "&#039;") + '\'></div>';
                }
            }
            if(data.object.urls !== undefined){
                if(data.object.urls.expanded_url.match(/(?:http:\/\/|https:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)(.+)/)){
                    var uid = data.object.urls.expanded_url.replace(/(?:http:\/\/|https:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)(.+)/, '$1');
                    tweet += '<div class="video-container"><iframe width="560" height="315" src="https://www.youtube.com/embed/'+uid+'" frameborder="0" allowfullscreen></iframe></div>';
                }
            }
        }
        if (data.object.retweeted_status === undefined && data.object.quoted_status === undefined) {
            data.object.entities.user_mentions.some(function(e){
                if(e.screen_name == socket.user.screen_name){
                    if(action == 'prepend'){
                        $('<div class="divider"></div><div class="card blue-grey darken-1 white-text tweet" id="tweet-' + data.object.id_str + '" data-tweet-id="'+data.object.id_str+'" data-mentions="'+ marray.toString() +'" style="display: none">' + medialink + '<div class="card-content"><span class="card-title left-align"><img src="' + data.object.user.profile_image_url_https + '" alt="Profilbild" class="circle responsive-img">' + data.object.user.name + '<a target="_blank"id="username" class="grey-text lighten-3" href="https://twitter.com/' + data.object.user.screen_name + '">@' + data.object.user.screen_name + '</a></span><p>' + tweet + '</p> </div></div>').prependTo($('#notifications')).slideDown(300);
                    }else if(action == 'append'){
                        $('<div class="divider"></div><div class="card blue-grey darken-1 white-text tweet" id="tweet-' + data.object.id_str + '" data-tweet-id="'+data.object.id_str+'" data-mentions="'+ marray.toString() +'" style="display: none">' + medialink + '<div class="card-content"><span class="card-title left-align"><img src="' + data.object.user.profile_image_url_https + '" alt="Profilbild" class="circle responsive-img">' + data.object.user.name + '<a target="_blank"id="username" class="grey-text lighten-3" href="https://twitter.com/' + data.object.user.screen_name + '">@' + data.object.user.screen_name + '</a></span><p>' + tweet + '</p> </div></div>').appendTo($('#notifications')).slideDown(300);
                    }
                    return true
                }
            });
        } else if (data.object.quoted_status === undefined) {
            if(data.object.retweeted_status.user.screen_name == socket.user.screen_name){
                if(action == 'prepend'){
                    $('<div class="divider"></div><div class="card blue-grey darken-1 white-text" style="display: none"><div class="card-content"><img src="' + data.object.user.profile_image_url_https + '" alt="Profilbild" class="circle responsive-img">' + data.object.user.name + '<a target="_blank"id="username" class="grey-text lighten-3" href="https://twitter.com/' + data.object.user.screen_name + '"> @' + data.object.user.screen_name + '</a> retweeted <br><blockquote><div class="card blue-grey darken-1 white-text z-depth-3 tweet" id="tweet-' + data.object.retweeted_status.id_str + '"><div class="card-content"><span class="card-title left-align"><img src="' + data.object.retweeted_status.user.profile_image_url_https + '" alt="Profilbild" class="circle responsive-img">' + data.object.retweeted_status.user.name + '<a target="_blank"id="username" class="grey-text lighten-3" href="https://twitter.com/' + data.object.retweeted_status.user.screen_name + '"> @' + data.object.retweeted_status.user.screen_name + '</a></span><p>' + tweet + '</p> </div></blockquote> </div> </div>').prependTo($('#notifications')).slideDown(300);
                }else if(action == 'append'){
                    $('<div class="divider"></div><div class="card blue-grey darken-1 white-text" style="display: none"><div class="card-content"><img src="' + data.object.user.profile_image_url_https + '" alt="Profilbild" class="circle responsive-img">' + data.object.user.name + '<a target="_blank"id="username" class="grey-text lighten-3" href="https://twitter.com/' + data.object.user.screen_name + '"> @' + data.object.user.screen_name + '</a> retweeted <br><blockquote><div class="card blue-grey darken-1 white-text z-depth-3 tweet" id="tweet-' + data.object.retweeted_status.id_str + '"><div class="card-content"><span class="card-title left-align"><img src="' + data.object.retweeted_status.user.profile_image_url_https + '" alt="Profilbild" class="circle responsive-img">' + data.object.retweetd_status.user.name + '<a target="_blank"id="username" class="grey-text lighten-3" href="https://twitter.com/' + data.object.retweeted_status.user.screen_name + '"> @' + data.object.retweeted_status.user.screen_name + '</a></span><p>' + tweet + '</p> </div></blockquote> </div> </div>').prependTo($('#notifications')).slideDown(300);
                }
            }
        } else if (data.object.quoted_status !== undefined) {
            data.object.entities.user_mentions.some(function(e){
                if(e.screen_name == socket.user.screen_name){
                    if(action == 'prepend'){
                        $('<div class="divider"></div><div class="card blue-grey darken-1 white-text tweet" id="tweet-' + data.object.id_str + '" data-tweet-id="'+data.object.id_str+'" data-mentions="'+ marray.toString() +'" style="display: none"><div class="card-content"><span class="card-title left-align"><img src="' + data.object.user.profile_image_url_https + '" alt="Profilbild" class="circle responsive-img">' + data.object.user.name + '<a target="_blank"id="username" class="grey-text lighten-3" href="https://twitter.com/' + data.object.user.screen_name + '">@' + data.object.user.screen_name + '</a></span><p>' + tweet.main + '</p><blockquote><div class="card blue-grey darken-1 white-text z-depth-3 tweet" id="tweet-' + data.object.quoted_status.id_str + '">' + medialink + '<div class="card-content"><span class="card-title left-align"><img src="' + data.object.quoted_status.user.profile_image_url_https + '" alt="Profilbild" class="circle responsive-img">' + data.object.quoted_status.user.name + '<a target="_blank"id="username" class="grey-text lighten-3" href="https://twitter.com/' + data.object.quoted_status.user.screen_name + '"> @' + data.object.quoted_status.user.screen_name + '</a></span><p>' + tweet.sec + '</p></div></blockquote></div></div>').prependTo($('#notifications')).slideDown(300);
                    }else if(action == 'append'){
                        $('<div class="divider"></div><div class="card blue-grey darken-1 white-text tweet" id="tweet-' + data.object.id_str + '" data-tweet-id="'+data.object.id_str+'" data-mentions="'+ marray.toString() +'" style="display: none"><div class="card-content"><span class="card-title left-align"><img src="' + data.object.user.profile_image_url_https + '" alt="Profilbild" class="circle responsive-img">' + data.object.user.name + '<a target="_blank"id="username" class="grey-text lighten-3" href="https://twitter.com/' + data.object.user.screen_name + '">@' + data.object.user.screen_name + '</a></span><p>' + tweet.main + '</p><blockquote><div class="card blue-grey darken-1 white-text z-depth-3 tweet" id="tweet-' + data.object.quoted_status.id_str + '">' + medialink + '<div class="card-content"><span class="card-title left-align"><img src="' + data.object.quoted_status.user.profile_image_url_https + '" alt="Profilbild" class="circle responsive-img">' + data.object.quoted_status.user.name + '<a target="_blank"id="username" class="grey-text lighten-3" href="https://twitter.com/' + data.object.quoted_status.user.screen_name + '"> @' + data.object.quoted_status.user.screen_name + '</a></span><p>' + tweet.sec + '</p></div></blockquote></div>').prependTo($('#notifications')).slideDown(300);
                    }
                    return true
                }
            });
        }
    }
};

Renderer.prototype.newTweet = function (reply, socket) {
    if (socket === undefined) {
        socket = this.socket;
    }
    var modalNumber = spawnModal(),
        inReply = '',
        formExtra = '',
        prefill = '',
        tlength = 140,
        marray = '';
    if (reply !== undefined) {
        inReply = '<blockquote>' + $('#tweet-' + reply.attr('data-in-response')).clone().html() + '</blockquote>';
        formExtra = '<input name="in_reply_to_status_id" type="hidden" value="' + reply.attr('data-in-response') + '">';
        if($('#tweet-' + reply.attr('data-in-response')).attr('data-mentions') !== undefined){
            marray = $('#tweet-' + reply.attr('data-in-response')).attr('data-mentions');
        }
        console.log(marray);
        var mentions = (marray.split(',')).filter( function( item, index, inputArray ) {
            if(item != '@'+socket.user.screen_name){
                return inputArray.indexOf(item) == index;
            }
        });
        console.log(mentions);
        prefill = (mentions.toString()).replace(',', ' ') + ' ';
    }
    if (typeof $voiceblob != 'undefined'){
        inReply = '<blockquote><audio controls id="play"><source src="'+window.URL.createObjectURL($voiceblob)+'" type="audio/mpeg">Your browser does not support the audio element.</audio></blockquote>'+inReply;
        tlength = (tlength - 2) - tconfig.short_url_length_https
    }
    $('#modal' + modalNumber + '-header').text(lang.external.newtweet);
    $('#modal' + modalNumber + '-content').html(inReply + '<div class="row"> <form class="col s12 ajax-form" method="post" action="/api/twitter/postTweet"> <div class="row"> <div class="input-field col s12">' + formExtra + '<textarea id="text" class="materialize-textarea" length="'+tlength+'" name="status">' + prefill + '</textarea><label for="text">'+lang.external.tweet_something+'</label> </div><button class="btn waves-effect waves-light blue" type="submit">'+lang.external.tweet+'<i class="material-icons right">send</i> </button> </div> </form> </div>');
    $('textarea#text').characterCounter();
    /*if (typeof $voiceblob == 'undefined'){
        $('#modal' + modalNumber + '-content').append('<div class="box z-depth-2" id="uploadBox"></div>');
        $("#uploadBox").dropzone({
            url: "/file/post"
        });
    }*/
    $('#modal' + modalNumber).openModal({
        dismissible: true,
        opacity: .5,
        ready: function(){
            $('#modal' + modalNumber + ' form textarea').focus().setCursorToTextEnd();
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
            }
        });
        if (typeof $voiceblob != 'undefined'){
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
                            socket.postStatus($('#modal' + modalNumber + ' form').serialize() + ' %0D%0A' + e.path, modalNumber2);
                            console.log(e);
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
            socket.postStatus($(this).serialize(), modalNumber2);
        }
        $('#modal' + modalNumber).closeModal();
    });
    return this
};
Renderer.prototype.newRt = function (id, isQuote, socket) {
    if (socket === undefined) {
        socket = this.socket;
    }
    if (isQuote === true) {
        var reply = $('#tweet-' + id);
        var modalNumber = spawnModal(),
            inReply = '<blockquote>' + $(reply).children('.card-content').clone().html() + '</blockquote>',
            count = 138 - tconfig.short_url_length_https;
        $('#modal' + modalNumber + '-header').text(lang.external.quote_tweet);
        $('#modal' + modalNumber + '-content').html(inReply + ' <div class="row"> <form class="col s12 ajax-form" method="post" action="/api/twitter/postTweet"> <div class="row"> <div class="input-field col s12"><textarea id="text" class="materialize-textarea" length="' + count + '" name="status"></textarea> <label for="text">'+lang.external.tweet_something+'</label> </div><button class="btn waves-effect waves-light blue" type="submit">'+lang.external.tweet+'<i class="material-icons right">send</i> </button> </div> </form> </div>');
        $('textarea#text').characterCounter();
        $('#modal' + modalNumber).openModal({
            dismissible: true,
            opacity: .5,
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
                }
            });
            socket.postStatus($(this).serialize() + ' %0D%0A' + $('#tweet-' + id + ' .card-title #username').attr('href') + '/status/' + id, modalNumber2);
            $('#modal' + modalNumber).closeModal();
        });
        return this
    } else {
        socket.postRt(id);
    }
};
Renderer.prototype.addTL = function(socket, id){
};

function youtube_parser(url) {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    return (match && match[7].length == 11) ? match[7] : false;
}