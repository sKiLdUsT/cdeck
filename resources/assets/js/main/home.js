function homePage() {
    window.$tweetFile = [];
    window.renderer = new CdeckRenderer();

    // We have to periodically clean up our modals since
    // Materialize is too stupid to fire our cleanup callback
    setInterval(function () {
        $('.modal').each(function () {
            if (!$(this).is(':visible')) {
                log.debug('GC: Cleaned Modal');
                $(this).remove();
            }
        })
    }, 1000);

    // Set main section to fixed
    $('body > .section > main').css('position', 'fixed');

    // Add client event listeners
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

    // Bind click events
    bindEvents();

    // Bind menu events
    homeMenu();

    // Bind icons of rows to scroll to top of list
    $('.section h4').each(function () {
        $(this).on('click', function () {
            log.debug('UI: ".section h4" clicked');
            $(this).siblings('div').animate({scrollTop: 0}, '300', 'swing');
        });
    });
    $('.section div.pad').each(function () {
        $(this).on('scroll', function () {
            if ($(this).scrollTop() < $(this).children('div.card:first').outerHeight(true)) {
                log.debug('UI: scrolled to top, removing chip');
                $(this).siblings('h4').find('span.new.badge').remove();
            }
        });
    });

    // Update time chip of tweets
    setInterval(function () {
        $('.chip.time').each(function () {
            $(this).html(moment($(this).attr('data-time')).fromNow())
        });
        log.debug('UI: Updated chip time');
    }, 30000);

    // Seems to be important for scaling or some shit, idk anymore
    // DONT touch!
    var body, html, height;
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
}

// Bind click events
function bindEvents() {
    // Bind for "New Tweet" button
    $('#newTweet').on('click', function () {
        log.debug('UI: #newTweet clicked');
        renderer.newTweet();
    });

    // Binds for Drag&Drop upload
    $(document).on('drag dragstart dragend dragover dragenter dragleave drop', function (e) {
        e.preventDefault();
        e.stopPropagation();
    })
        .on('dragover dragenter', function () {
            log.debug('UI: drag started');
            $('#dragdrop').fadeIn();
        })
        .on('dragleave dragend drop', function () {
            log.debug('UI: drag stopped');
            $('#dragdrop').fadeOut();
        })
        .on('drop', function (e) {
            log.debug('UI: dropped');
            if (window.$tweetFile.length < 4 && e.originalEvent.dataTransfer.files.length <= 4) {
                var files = e.originalEvent.dataTransfer.files;
                for (var i = 0; i < files.length; i++) {
                    window.$tweetFile.forEach(function (object) {
                        if (files[i] === object.file)return Materialize.toast('File already added', 2000);
                    });
                    if (window.$tweetFile.length < 4 && window.$tweetFile.find(function (object) {
                            return (object.type === 'video' || object.type === 'gif')
                        }) === undefined) {
                        if (files[i].type == 'image/png' || files[i].type == 'image/jpeg' || files[i].type == 'image/webp') {
                            if (files[i].size > 3145728)return Materialize.toast('File ' + (i + 1) + '/' + files.length + ' above 3MB file limit', 2000);
                            window.$tweetFile.push({file: files[i], type: 'image'})
                        } else if (files[i].type == 'image/gif' && window.$tweetFile.length === 0) {
                            if (files[i].size > 5242880)return Materialize.toast('File ' + (i + 1) + '/' + files.length + ' above 5MB file limit', 2000);
                            window.$tweetFile.push({file: files[i], type: 'gif'})
                        } else if (files[i].type == 'video/mp4' && window.$tweetFile.length === 0) {
                            if (files[i].size > 536870912)return Materialize.toast('File ' + (i + 1) + '/' + files.length + ' above 512MB file limit', 2000);
                            $('<video style="display:none;height:0;width:0" id="shadowplayer"><source type="video/mp4" src="' + URL.createObjectURL(files[i]) + '"></video>').appendTo('body');
                            var duration;
                            $.when(duration = $('#shadowplayer').duration).then($('#shadowplayer').remove());
                            if (duration > 140)return Materialize.toast('File ' + (i + 1) + '/' + files.length + ' above 1:20 duration limit', 2000);
                            window.$tweetFile.push({file: files[i], type: 'video'})
                        } else if (window.$tweetFile.length !== 0) {
                            return Materialize.toast('You can\'t mix videos/gifs and images', 3000);
                        } else {
                            return Materialize.toast('Unsupported file type', 3000);
                        }
                    } else if (window.$tweetFile.length < 4) {
                        return Materialize.toast('You can only send one video or gif alone at the time', 3000);
                    } else {
                        Materialize.toast('You cannot drop more files', 3000);
                        return console.warn('cDeck: Either 4 image or 1 video/gif limit reached. Object: \n' + JSON.stringify(window.$tweetFile));
                    }
                    if ($('.modal').length == 0) {
                        renderer.newTweet();
                    } else {
                        if (!$('.modal').is(':visible')) {
                            $('.modal').remove();
                            return renderer.newTweet();
                        }
                        if (!$('#image-holder').is(':visible')) $('#image-holder').fadeIn();
                        var html = '<div class="col s3" id="media-' + (window.$tweetFile.length - 1) + '"><div style="display:none;height:100%;width:100%;position:fixed;background-color:rgba(0,0,0,0.6);border-radius: 10%;" class="valign-wrapper" id="iloader"><div class="progress"><div class="determinate" style="width: 0"></div></div></div> ';
                        if (files[i].type == 'image/png' || files[i].type == 'image/jpeg' || files[i].type == 'image/webp' || files[i].type == 'image/gif') {
                            html += '<img id="tweetMedia" class="responsive-img" src="' + URL.createObjectURL(files[i]) + '"></div>'
                        } else if (files[i].type === 'video/mp4') {
                            html += '<video id="tweetMedia" class="responsive-video" controls><source src="' + URL.createObjectURL(files[i]) + '" type="' + files[i].type + '"></video></div>'
                        }
                        $(html).appendTo('#image-holder');
                    }
                }
            } else {
                Materialize.toast('You cannot drop more fies', 3000);
                console.warn('cDeck: Either 4 image or 1 video limit reached. Object: \n' + JSON.stringify(window.$tweetFile));
            }
        });

    // Catch pasted images
    $('body').pasteImageReader(function (results) {
        log.debug('UI: pasted from clipboard');
        if (!$('.modal').is(':visible')) renderer.newTweet();
        if (window.$tweetFile.length < 4 && window.$tweetFile.find(function (object) {
                return (object.type === 'video' || object.type === 'gif')
            }) === undefined) {
            window.$tweetFile.forEach(function (object) {
                if (results.file === object.file)return Materialize.toast('File already added', 2000);
            });
            if (results.file.size > 3145728)return Materialize.toast('Pasted image above 3MB file limit', 2000);
            window.$tweetFile.push({file: results.file, type: 'image'});
            var html = '<div class="col s3" id="media-' + (window.$tweetFile.length - 1) + '"><div style="display:none;height:100%;width:100%;position:fixed;background-color:rgba(0,0,0,0.6);border-radius: 10%;" class="valign-wrapper" id="iloader"><div class="progress"><div class="determinate" style="width: 0"></div></div></div><img id="tweetMedia" class="responsive-img" src="' + results.dataURL + '"></div>';
            if (!$('#image-holder').is(':visible')) $('#image-holder').fadeIn();
            $(html).appendTo('#image-holder');
        } else if (window.$tweetFile.length < 4) {
            Materialize.toast('You can only send one video or gif alone at the time', 3000);
        } else {
            Materialize.toast('You cannot drop more fies', 3000);
            console.warn('cDeck: Either 4 image or 1 video/gif limit reached. Object: \n' + JSON.stringify(window.$tweetFile));
        }
    });
}