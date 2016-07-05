var cDeck = function () {
    this.host = location.host + ':24789';
    this.renderer = new Renderer();
};

function CDeckError() {
    Error.apply(this, arguments);
    this.name = "cDeckError";
}
CDeckError.prototype = Object.create(Error.prototype);
try {
    cDeck.prototype.connect = function () {
        var socket = io(this.host);
        var data = Object;
        var renderer = this.renderer;
        $.ajax({
            url: 'http://'+window.location.hostname+'/api/twitter/getToken',
            async: false,
            dataType: 'json',
            success: function (response) {
                data = response
            }
        });
        Materialize.toast('Verbinde zum Upstream-Server', 2000);
        socket.emit('register', data, function (response) {
            if (response == true) {
                Materialize.toast('Verbunden!', 2000);
            } else {
                console.log(response);
                socket.close();
                renderer.failed("Registrierung am Server gescheitert");
                Materialize.toast('Verbindung gescheitert: ' + response.error, 2000);
                throw new Error("Socket connection failed: " + response.error)
            }
        });
        this.socket = socket;
        this.socket.on('timeline', function (data) {
            console.log(data);
            data.forEach(function (item) {
                $('#timeline .preloader-wrapper').hide();
                renderer.display(item)
            })
        });
        this.socket.on('reconnecting', function () {
            Materialize.toast('Verbindung verloren. Wir versuchen es noch einmal...', 5000);
        });
        this.socket.on('reconnect_error', function () {
            Materialize.toast('Verbindung gescheitert.', 5000);
            $.ajax({
                url: 'https://www.google.de/?gws_rd=ssl',
                async: false,
                timeout: 5000,
                success: function(){Materialize.toast('Es scheint an uns zu liegen. Wir kümmern uns darum!', 5000)},
                error: function(){Materialize.toast('Du scheinst Verbindungsprobleme zu haben.', 5000)}
            });
        });
        return this
    };

    cDeck.prototype.preLive = function () {

    };

    cDeck.prototype.close = function () {
        if (this.socket) {
            this.socket.disconnect()
        }
        return this
    };

    var Renderer = function () {
        this.patterns = [];
        this.patterns['mailto'] = '([_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,3}))';
        this.patterns['user'] = ' +@([a-z0-9_]*)?';
        this.patterns['hashtag'] = '(?:(?<=\s)|^)#(\w*[\p{L}-\d\p{Cyrillic}\d]+\w*)';
        this.patterns['long_url'] = '>(([[:alnum:]]+:\/\/)|www\.)?([^[:space:]]{12,22})([^[:space:]]*)([^[:space:]]{12,22})([[:alnum:]#?\/&=])<';
        this.count = 0;
        this.index = {};
    };
    Renderer.prototype.display = function (data) {
        if(this.count == 100){
            this.index.slice(Math.max(this.index.length - 10, 1)).forEach(function(item, indx){
                $('#tweet-'+item[indx]).remove();
            })
        }
        if (data.text !== undefined){
            var tweet = data.text;
            if (data.entities !== undefined){
                if (data.retweeted_status === undefined && data.quoted_status === undefined){
                    tweet = twttr.txt.autoLink(tweet, {urlEntities: data.entities.urls});
                } else if (data.quoted_status === undefined){
                    tweet = twttr.txt.autoLink(data.retweeted_status.text, {urlEntities: data.retweeted_status.entities.urls});
                } else {
                    tweet = twttr.txt.autoLink(data.quoted_status.text, {urlEntities: data.entities.urls});
                }
                var medialink = '';
                if (data.entities.media !== undefined){
                    if (data.retweeted_status === undefined && data.quoted_status === undefined){
                        medialink = '<div class="card-image"><img src="' + data.entities.media[0].media_url_https + '" class="materialboxed" data-caption=\''+tweet+'\'></div>';
                    } else if (data.quoted_status === undefined){
                        medialink = '<div class="card-image"><img src="' + data.retweeted_status.entities.media[0].media_url_https + '" class="materialboxed" data-caption=\''+tweet+'\'></div>';
                    } else {
                        medialink = '<div class="card-image"><img src="' + data.quoted_status.entities.media[0].media_url_https + '" class="materialboxed" data-caption=\''+tweet+'\'></div>';
                    }
                }
            }
            var tweetid = '0';
            if (data.retweeted_status === undefined && data.quoted_status === undefined){
                $('<div class="divider"></div><div class="card blue-grey darken-1 white-text" id="tweet-' + data.id_str + '" style="display: none">' + medialink + '<div class="card-content"><span class="card-title left-align"><img src="' + data.user.profile_image_url_https + '" alt="Profilbild" class="circle responsive-img">' + data.user.name + '<a id="username" class="grey-text lighten-3" href="https://twitter.com/' + data.user.screen_name + '"> @' + data.user.screen_name + '</a></span><p>' + tweet + '</p> </div> <div class="card-action"> <a href="#">This is a link</a> <a href="#">This is a link</a></div></div>').prependTo($('#timeline')).slideDown(400);
                $('#tweet-'+data.id_str+' .materialboxed').materialbox();
                console.log("New Tweet added");
                console.log(tweet);
                tweetid = data.id_str
            } else if (data.quoted_status === undefined){
                console.log(data);
                $('<div class="divider"></div><div class="card blue-grey darken-1 white-text" id="tweet-' + data.retweeted_status.id_str + '" style="display: none"><div class="card-content"><span class="card-title left-align"><img src="' + data.user.profile_image_url_https + '" alt="Profilbild" class="circle responsive-img">' + data.user.name + '<a id="username" class="grey-text lighten-3" href="https://twitter.com/' + data.user.screen_name + '"> @' + data.user.screen_name + '</a></span><blockquote><div class="card blue-grey darken-1 white-text z-depth-3" id="tweet-' + data.retweeted_status.id + '">' + medialink + '<div class="card-content"><span class="card-title left-align"><img src="' + data.retweeted_status.user.profile_image_url_https + '" alt="Profilbild" class="circle responsive-img">' + data.retweeted_status.user.name + '<a id="username" class="grey-text lighten-3" href="https://twitter.com/' + data.retweeted_status.user.screen_name + '"> @' + data.retweeted_status.user.screen_name + '</a></span><p>' + tweet + '</p> </div></blockquote> </div> <div class="card-action"> <a href="#">This is a link</a> <a href="#">This is a link</a></div></div>').prependTo($('#timeline')).slideDown(400);
                $('#tweet-'+data.retweeted_status.id_str+' .materialboxed').materialbox();
                console.log("New Retweet added");
                console.log(tweet);
                tweetid = data.retweeted_status.id_str
            }
            this.index += this.count[tweetid]
        }else if(data.delete !== undefined){
            $('#tweet-'+data.delete.status.id_str).remove();
            console.log('Tweet '+data.delete.status.id_str+' removed')
        }else if(data.event !== undefined ){
            console.log('New Like')
        }
    };
    Renderer.prototype.failed = function (reason) {
        console.log(reason);
    };
    Renderer.prototype.newTweet = function () {
        var modalNumber = spawnModal();
        var modal = $('#modal' + modalNumber);
        $('#modal' + modalNumber + '-header').text('Neuer Tweet');
        $('#modal' + modalNumber + '-content').html(' <div class="row"> <form class="col s12 ajax-form" method="post" action="/api/twitter/postTweet"> <div class="row"> <div class="input-field col s12"> <textarea id="text" class="materialize-textarea" length="140" name="status"></textarea> <label for="text">Tweete etwas...</label> </div><button class="btn waves-effect waves-light blue" type="submit">Tweeten<i class="material-icons right">send</i> </button> </div> </form> </div>');
        $('textarea#textarea-' + modalNumber).characterCounter();
        ajaxForm($('.ajax-form'));
        modal.openModal({
            dismissible: true,
            opacity: .5,
            complete: function () {
                modal.remove()
            }
        });

        return this
    };
} catch (e) {
    if (e instanceof CDeckError) {
        Materialize.toast('Da ist was schief gelaufen!', 5000);
        console.log(e);
    } else {
        throw e;
    }
}

function youtube_parser(url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
}