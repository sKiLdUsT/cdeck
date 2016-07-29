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
        'I can’t let you do that, Starfox!'
    ];

function CDeckError(message) {
    Error.apply(this, arguments);
    this.name = "cDeckError";
    this.message = (message || "Not specified error.");
    Materialize.toast(errmsg[Math.floor(Math.random()*errmsg.length)], 5000);
}
CDeckError.prototype = Object.create(Error.prototype);
cDeck.prototype.connect = function () {
    var socket = io.connect({path: "/api/upstream", 'force new connection' : true}),
        data = {},
        renderer = this.renderer,
        self = this,
        rShow = 0,
        errorModal = '';
    $.ajax({
        url: '/api/twitter/getToken',
        async: false,
        dataType: 'json',
        success: function (response) {
            data = response
        }
    });
    function register() {
        socket.emit('register', data, function (response) {
            if (response == true) {
                Materialize.toast('Angemeldet!', 2000);
                $('#timeline').empty();
                $('<div class="preloader-wrapper big active" style="display:none;" id="preloader' + modalCount + '"><div class="spinner-layer spinner-blue"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div><div class="spinner-layer spinner-red"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div><div class="spinner-layer spinner-yellow"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div><div class="spinner-layer spinner-green"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div>').prependTo($('#timeline')).slideDown(300);
            } else {
                if(response.error == "double connect"){
                    console.log("cDeck: Double Connect detected.")
                }else{
                    socket.close();
                    Materialize.toast('Anmeldung gescheitert: ' + response.error, 2000);
                    throw new CDeckError("Login failed: " + response.error)
                }
            }
        });
    }
    register();
    this.user = data;
    this.socket = socket;
    /*this.socket.on('connect', function () {
        register();
    });*/
    this.socket.on('reconnect', function () {
            if (errorModal !== '') {
                $('#modal' + errorModal).closeModal();
                //$('#modal' + errorModal).remove();
                errorModal = ''
            }
            rShow = 0;
            register();
    });
    this.socket.on('timeline', function (data) {
        data.forEach(function (item) {
            $('#timeline .preloader-wrapper').hide();
            $('#notifications .preloader-wrapper').hide();
            renderer.display(item, self)
        })
    });
    this.socket.on('connect_error', function () {
        if (errorModal === '') {
            errorModal = spawnModal();
            var modal = $('#modal' + errorModal);
            modal.addClass('bottom-sheet');
            modal.openModal({
                dismissible: false, ready: function () {
                    $('#modal' + errorModal + '-content').text('Keine Verbindung zum Upstream-Server, wir versuchen es weiter...');
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
                    $('#modal' + errorModal + '-content').text('Keine Verbindung zum Upstream-Server, wir versuchen es weiter...');
                    $('#preloader' + errorModal).show();
                }
            });
        }
    });
    this.socket.on('reconnect_error', function () {
        if (rShow !== 1) {
            Materialize.toast('Verbindung gescheitert.', 5000);
            $.ajax({
                url: '/api/debug/ping',
                async: true,
                timeout: 5000,
                success: function () {
                    Materialize.toast('Es scheint an uns zu liegen. Wir kümmern uns darum!', 5000);
                    rShow = 1
                },
                error: function () {
                    Materialize.toast('Du scheinst Verbindungsprobleme zu haben.', 5000);
                    rShow = 0
                }
            });
        }
    });
    this.socket.on('fatal_error', function(err){
            throw new CDeckError('Server error: '+err);
    });
    console.log(this.socket);
    /*if(registered === 0){
        register();
        registered = 1
    }*/
    return this
};

cDeck.prototype.close = function(){
    this.socket.emit('disconnect');
    this.socket.destroy();
    return this
};

cDeck.prototype.postStatus = function (data, modal) {
    if (this.socket) {
        this.socket.emit('postStatus', {user: this.user, tweet: data}, function (response) {
            if (response.result === true) {
                $('#modal' + modal).closeModal();
            } else {
                //Materialize.toast('Fehlgeschlafen', 2000);
                $('#modal' + modal).closeModal();
                throw new CDeckError('Update status failed: '+response.twitter.message);
            }
        })
    }
    return this
};
cDeck.prototype.postRt = function (data, modal) {
    if (this.socket) {
        this.socket.emit('postRt', {user: this.user, id: data}, function (response) {
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
        this.socket.emit('postLike', {user: this.user, id: data}, function (response) {
            if (response.result === true) {
                $('#tweet-' + data + ' #like i').html('favorite');
            } else {
                //Materialize.toast('Fehlgeschlafen', 2000);
                console.log(response);
                throw new CDeckError('Like failed: '+response.twitter.message);
            }
        })
    }
    return this
};

var Renderer = function (upstream) {
    this.patterns = [];
    this.patterns['mailto'] = '([_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,3}))';
    this.patterns['user'] = ' +@([a-z0-9_]*)?';
    this.patterns['hashtag'] = '(?:(?<=\s)|^)#(\w*[\p{L}-\d\p{Cyrillic}\d]+\w*)';
    this.patterns['long_url'] = '>(([[:alnum:]]+:\/\/)|www\.)?([^[:space:]]{12,22})([^[:space:]]*)([^[:space:]]{12,22})([[:alnum:]#?\/&=])<';
    this.count = 0;
    this.index = {};
    this.socket = upstream;
    var self = this;
    $.get('/api/twitter/tconfig', function (data) {
        self.config = data
    }, 'json');
};
Renderer.prototype.display = function (data, socket) {
    var self = this;
    this.socket = socket;
    var fav = '';
    if (this.count == 100) {
        this.index.slice(Math.max(this.index.length - 10, 1)).forEach(function (item, indx) {
            $('#tweet-' + item[indx]).remove();
        })
    }
    if (data.text !== undefined) {
        var tweet = data.text;
        if (data.entities !== undefined) {
            if (data.retweeted_status === undefined && data.quoted_status === undefined) {
                tweet = twttr.txt.autoLink(tweet, {urlEntities: data.entities.urls});
                if (data.favorited === true) {
                    fav = 'favorite'
                } else {
                    fav = 'favorite_border'
                }
            } else if (data.quoted_status === undefined) {
                tweet = twttr.txt.autoLink(data.retweeted_status.text, {urlEntities: data.retweeted_status.entities.urls});
                if (data.retweeted_status.favorited === true) {
                    fav = 'favorite'
                } else {
                    fav = 'favorite_border'
                }
            } else if (data.quoted_status !== undefined) {
                tweet = {
                    'main': data.text.replace(/(?:https?|http):\/\/[\n\S]+/g, ''),
                    'sec': twttr.txt.autoLink(data.quoted_status.text, {urlEntities: data.quoted_status.entities.urls})
                };
                if (data.favorited === true) {
                    fav = 'favorite'
                } else {
                    fav = 'favorite_border'
                }
            }
            var medialink = '';
            if (data.entities.media !== undefined) {
                if (data.retweeted_status === undefined && data.quoted_status === undefined) {
                    medialink = '<div class="card-image"><img src="' + data.entities.media[0].media_url_https + '" class="materialboxed" data-caption=\'' + tweet.replace(/'/g, "&#039;") + '\'></div>';
                } else if (data.quoted_status === undefined) {
                    medialink = '<div class="card-image"><img src="' + data.retweeted_status.entities.media[0].media_url_https + '" class="materialboxed" data-caption=\'' + tweet.replace(/'/g, "&#039;") + '\'></div>';
                } else {
                    medialink = '<div class="card-image"><img src="' + data.quoted_status.entities.media[0].media_url_https + '" class="materialboxed" data-caption=\'' + tweet.replace(/'/g, "&#039;") + '\'></div>';
                }
            }
        }
        var tweetid = '0';
        if (data.retweeted_status === undefined && data.quoted_status === undefined) {
            $('<div class="divider"></div><div class="card blue-grey darken-1 white-text" id="tweet-' + data.id_str + '" style="display: none">' + medialink + '<div class="card-content"><span class="card-title left-align"><img src="' + data.user.profile_image_url_https + '" alt="Profilbild" class="circle responsive-img">' + data.user.name + '<a id="username" class="grey-text lighten-3" href="https://twitter.com/' + data.user.screen_name + '"> @' + data.user.screen_name + '</a></span><p>' + tweet + '</p> </div> <div class="card-action"> <a id="reply" data-in-response="' + data.id_str + '" href="#"><i class="material-icons">reply</i></a></a><a id="retweet" class="dropdown-button" data-beloworigin="true" data-activates="dropdown-' + data.id_str + '" href="#"><i class="material-icons">repeat</i></a><ul id="dropdown-' + data.id_str + '" class="dropdown-content"><li><a id="rt" href="#">Retweet</a></li><li><a id="rt_quote" href="#">Quote Tweet</a></li></ul><a id="like" href="#"><i class="material-icons">' + fav + '</i></div></div>').prependTo($('#timeline')).slideDown(300);
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
            tweetid = data.id_str
        } else if (data.quoted_status === undefined) {
            if ($('#tweet-' + data.retweeted_status.id_str).length !== 0) {
                $('#tweet-' + data.retweeted_status.id_str).remove()
            }
            $('<div class="divider"></div><div class="card blue-grey darken-1 white-text" id="tweet-' + data.id_str + '" style="display: none"><div class="card-content"><span class="card-title left-align"><img src="' + data.user.profile_image_url_https + '" alt="Profilbild" class="circle responsive-img">' + data.user.name + '<a id="username" class="grey-text lighten-3" href="https://twitter.com/' + data.user.screen_name + '"> @' + data.user.screen_name + '</a></span><blockquote><div class="card blue-grey darken-1 white-text z-depth-3" id="tweet-' + data.retweeted_status.id_str + '">' + medialink + '<div class="card-content"><span class="card-title left-align"><img src="' + data.retweeted_status.user.profile_image_url_https + '" alt="Profilbild" class="circle responsive-img">' + data.retweeted_status.user.name + '<a id="username" class="grey-text lighten-3" href="https://twitter.com/' + data.retweeted_status.user.screen_name + '"> @' + data.retweeted_status.user.screen_name + '</a></span><p>' + tweet + '</p> </div></blockquote> </div> <div class="card-action">  <a id="reply" href="#"><i class="material-icons">reply</i></a><a id="retweet" class="dropdown-button" data-beloworigin="true" data-activates="dropdown-' + data.retweeted_status.id_str + '" href="#"><i class="material-icons">repeat</i></a><ul id="dropdown-' + data.retweeted_status.id_str + '" class="dropdown-content"><li><a id="rt" href="#">Retweet</a></li><li><a id="rt_quote" href="#">Quote Tweet</a></li></ul><a id="like" href="#"><i class="material-icons">' + fav + '</i></a></div></div>').prependTo($('#timeline')).slideDown(300);
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
            tweetid = data.id_str
        } else if (data.quoted_status !== undefined) {
            if ($('#tweet-' + data.quoted_status.id_str)) {
                $('#tweet-' + data.quoted_status.id_str).remove()
            }
            $('<div class="divider"></div><div class="card blue-grey darken-1 white-text" id="tweet-' + data.id_str + '" style="display: none"><div class="card-content"><span class="card-title left-align"><img src="' + data.user.profile_image_url_https + '" alt="Profilbild" class="circle responsive-img">' + data.user.name + '<a id="username" class="grey-text lighten-3" href="https://twitter.com/' + data.user.screen_name + '"> @' + data.user.screen_name + '</a></span><p>' + tweet.main + '</p><blockquote><div class="card blue-grey darken-1 white-text z-depth-3" id="tweet-' + data.quoted_status.id_str + '">' + medialink + '<div class="card-content"><span class="card-title left-align"><img src="' + data.quoted_status.user.profile_image_url_https + '" alt="Profilbild" class="circle responsive-img">' + data.quoted_status.user.name + '<a id="username" class="grey-text lighten-3" href="https://twitter.com/' + data.quoted_status.user.screen_name + '"> @' + data.quoted_status.user.screen_name + '</a></span><p>' + tweet.sec + '</p></div></blockquote> </div> <div class="card-action">  <a id="reply" href="#"><i class="material-icons">reply</i></a><a id="retweet" class="dropdown-button" data-beloworigin="true" data-activates="dropdown-' + data.quoted_status.id_str + '" href="#"><i class="material-icons">repeat</i></a><ul id="dropdown-' + data.quoted_status.id_str + '" class="dropdown-content"><li><a id="rt" href="#">Retweet</a></li><li><a id="rt_quote" href="#">Quote Tweet</a></li></ul><a id="like" href="#"><i class="material-icons">' + fav + '</i></a></div></div>').prependTo($('#timeline')).slideDown(300);
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
            tweetid = data.id_str
        }
        this.index += this.count[tweetid]
    } else if (data.delete !== undefined) {
        $('#tweet-' + data.delete.status.id_str).remove();
    } else if (data.event == 'favorite') {
        if (data.source.screen_name != socket.user.screen_name) {
            tweet = twttr.txt.autoLink(data.target_object.text, {urlEntities: data.target_object.entities.urls});
            $('<div class="divider"></div><div class="card blue-grey darken-1 white-text" style="display: none"><div class="card-content"><img src="' + data.source.profile_image_url_https + '" alt="Profilbild" class="circle responsive-img">' + data.source.name + '<a id="username" class="grey-text lighten-3" href="https://twitter.com/' + data.source.screen_name + '"> @' + data.source.screen_name + '</a> liked <br><blockquote><div class="card blue-grey darken-1 white-text z-depth-3" id="tweet-' + data.target_object.id_str + '"><div class="card-content"><span class="card-title left-align"><img src="' + data.target_object.user.profile_image_url_https + '" alt="Profilbild" class="circle responsive-img">' + data.target_object.user.name + '<a id="username" class="grey-text lighten-3" href="https://twitter.com/' + data.target_object.user.screen_name + '"> @' + data.target_object.user.screen_name + '</a></span><p>' + tweet + '</p> </div></blockquote> </div> </div>').prependTo($('#notifications')).slideDown(300);
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
        prefill = '';
    if (reply !== undefined) {
        inReply = '<blockquote>' + $('#tweet-' + reply.attr('data-in-response')).clone().html() + '</blockquote>';
        formExtra = '<input name="in_reply_to_status_id" type="hidden" value="' + reply.attr('data-in-response') + '">';
        prefill = $('#tweet-' + reply.attr('data-in-response') + ' #username').text() + ' ';
    }
    $('#modal' + modalNumber + '-header').text('Neuer Tweet');
    $('#modal' + modalNumber + '-content').html(inReply + '<div class="row"> <form class="col s12 ajax-form" method="post" action="/api/twitter/postTweet"> <div class="row"> <div class="input-field col s12">' + formExtra + '<textarea id="text" class="materialize-textarea" length="140" name="status">' + prefill + '</textarea><label for="text">Tweete etwas...</label> </div><button class="btn waves-effect waves-light blue" type="submit">Tweeten<i class="material-icons right">send</i> </button> </div> </form> </div>');
    $('textarea#text').characterCounter();
    $('#modal' + modalNumber).openModal({
        dismissible: true,
        opacity: .5,
        complete: function () {
            $(this).remove()
        }
    });
    $('#modal' + modalNumber + ' form').submit(function (event) {
        event.preventDefault();
        var modalNumber2 = spawnModal();
        var modal = $('#modal' + modalNumber2);
        modal.addClass('bottom-sheet');
        modal.openModal({
            dismissible: false, ready: function () {
                $('#modal' + modalNumber2 + '-content').text('Einen Moment...');
                $('#preloader' + modalNumber2).show();
            }
        });
        socket.postStatus($(this).serialize(), modalNumber2);
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
            inReply = '<blockquote>' + $(reply.clone()).remove('.card-action').html() + '</blockquote>',
            count = 138 - this.config.short_url_length_https;
        $('#modal' + modalNumber + '-header').text('Quote Tweet');
        $('#modal' + modalNumber + '-content').html(inReply + ' <div class="row"> <form class="col s12 ajax-form" method="post" action="/api/twitter/postTweet"> <div class="row"> <div class="input-field col s12"><textarea id="text" class="materialize-textarea" length="' + count + '" name="status"></textarea> <label for="text">Tweete etwas...</label> </div><button class="btn waves-effect waves-light blue" type="submit">Tweeten<i class="material-icons right">send</i> </button> </div> </form> </div>');
        $('textarea#text').characterCounter();
        $('#modal' + modalNumber).openModal({
            dismissible: true,
            opacity: .5,
            complete: function () {
                $(this).remove()
            }
        });
        $('#modal' + modalNumber + ' form').submit(function (event) {
            event.preventDefault();
            var modalNumber2 = spawnModal();
            var modal = $('#modal' + modalNumber2);
            modal.addClass('bottom-sheet');
            modal.openModal({
                dismissible: false, ready: function () {
                    $('#modal' + modalNumber2 + '-content').text('Einen Moment...');
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

function youtube_parser(url) {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    return (match && match[7].length == 11) ? match[7] : false;
}