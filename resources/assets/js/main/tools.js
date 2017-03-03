(function($){
    $.fn.setCursorToTextEnd = function() {
        var $initialVal = this.val();
        this.val($initialVal);
    };
})(jQuery);

var modalCount = 0;

function spawnModal() {
    modalCount++;
    try {
        var colormode = uconfig.colormode == "1" ? 'grey darken-3 white-text' : '';
    } catch(e) {
        log.warn('UI: '+e);
        var colormode = '';
    }
    var modal = '<div id="modal' + modalCount + '" class="modal '+colormode+'">\
        <div class="wrapper">\
        <div class="modal-content center-align">\
        <h4 id="modal' + modalCount + '-header"></h4>\
        <p id="modal' + modalCount + '-content">\
        <div class="preloader-wrapper big active" style="display:none;" id="preloader' + modalCount + '">\
        <div class="spinner-layer spinner-blue">\
        <div class="circle-clipper left">\
        <div class="circle"></div>\
        </div><div class="gap-patch">\
        <div class="circle"></div>\
        </div><div class="circle-clipper right">\
        <div class="circle"></div>\
        </div>\
        </div>\
        <div class="spinner-layer spinner-red">\
        <div class="circle-clipper left">\
        <div class="circle"></div>\
        </div><div class="gap-patch">\
        <div class="circle"></div>\
        </div><div class="circle-clipper right">\
        <div class="circle"></div>\
        </div>\
        </div>\
        <div class="spinner-layer spinner-yellow">\
        <div class="circle-clipper left">\
        <div class="circle"></div>\
        </div><div class="gap-patch">\
        <div class="circle"></div>\
        </div><div class="circle-clipper right">\
        <div class="circle"></div>\
        </div>\
        </div>\
        <div class="spinner-layer spinner-green">\
        <div class="circle-clipper left">\
        <div class="circle"></div>\
        </div><div class="gap-patch">\
        <div class="circle"></div>\
        </div><div class="circle-clipper right">\
        <div class="circle"></div>\
        </div>\
        </div>\
        </div></p>\
        </div>\
        </div>\
        </div>';
    $('body > .section').append(modal);
    return modalCount;
}

function ajaxNav(ancor) {
    event.preventDefault();
    var url = ancor.attr("href");
    $('.loader').fadeIn(300);
    $('body').css('overflow-y', 'hidden');
    if(cDeck instanceof CdeckClient){
        upstream.close();
    }
    $('.material-tooltip').remove();
    $("main > div.section").load(url + "?deliver=raw", function () {
        history.pushState({}, document.title, url);
    });
    $(document).on("ajaxComplete", function(){
        setTimeout(function(){
            $('body > div.loader').fadeOut(300, function () {
                $('body').css('overflow-y', '');
                window.eval($siteCode);
            });
        }, 1000)
    })
}

function setSize(ancor) {
    var arr = [], max = 0,
        $elements = $(ancor),
        body = document.body,
        html = document.documentElement,
        height = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );
    $elements.each(function() {
        arr.push($(this).offset().top);
    });
    max = Math.max.apply(null, arr);
    ancor.height(height - max);
    return true;
}

function healthCheck(url) {
    var errorModal = '';
    setInterval( function () {
        $.ajax({
            type: 'GET',
            url: url,
            error: function () {
                if( errorModal === '' ){
                    errorModal = spawnModal();
                    var modal = $('#modal' + errorModal);
                    modal.addClass('bottom-sheet');
                    modal.openModal({
                        dismissible: false, ready: function () {
                            $('#modal' + errorModal + '-content').text(lang.external.cleanup);
                            $('#preloader' + errorModal).show();
                        }
                    });
                    throw new CDeckError('Application in maintenance mode')
                }
            }, success: function(){
                if(errorModal !== '') {
                    $('#modal' + errorModal + '-content').text(lang.external.one_moment);
                    location.reload();
                }
            }
        })
    }, 5000 );
}
function changeUconfig(params, callback){
    var a = {};
    $.post({
        url: '/api/uconfig',
        data: params,
        success: function(data){
            a = data;
            if(data.response === true){
                window.uconfig = data.data;
                log.debug('Client: uconfig changed');
                if(typeof callback == 'function'){
                    callback(data.response);
                }
            } else {
                log.error('Client: uconfig change failed, rejected by server');
                throw new CDeckError('Changing uconfig failed')
            }
        },
        dataType: 'json',
        async: true
    });
}

function CDeckError( message ) {
    Error.apply( this, arguments );
    this.name = "cDeckError";
    this.message = ( message || "Non-specified error" );
}
CDeckError.prototype = Object.create(Error.prototype);

var windowIsVisible = (function(){
    var stateKey, eventKey, keys = {
        hidden: "visibilitychange",
        webkitHidden: "webkitvisibilitychange",
        mozHidden: "mozvisibilitychange",
        msHidden: "msvisibilitychange"
    };
    for (stateKey in keys) {
        if (stateKey in document) {
            eventKey = keys[stateKey];
            break;
        }
    }
    return function(c) {
        if (c) document.addEventListener(eventKey, c);
        return !document[stateKey];
    }
})();

function hexToRgbA(hex, alpha){
    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+alpha+')';
    }
    throw new Error('Bad Hex');
}

window.log = {
    debug: function(string){
        if(uconfig !== undefined && uconfig.debugmode)
            console.log('%c[DEBUG]'+'%c '+string,'background:blue;color:white','background:unset,color:unset')
    },
    info: function(string){
        console.info('%c[INFO]'+'%c  '+string,'background: green;color: white','background:unset,color:unset')
    },
    warn: function(string){
        console.warn('%c[WARN]'+'%c  '+string,'background: orange;color: white','background:unset,color:unset')
    },
    error: function(string){
        console.error('%c[ERROR]'+'%c '+string,'background: red;color: white','background:unset,color:unset')
    }
};

// Taken from http://stackoverflow.com/a/25490531
function getCookieValue(a) {
    var b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
}

function Y2RlY2s(){
    log.debug('Client: Hidden Mode triggered');
    log.warn('Console: "So you found the hidden mode, congrats! Now find the appropriate commands..."');
    try {
        var colormode = uconfig.colormode == "1" ? 'grey darken-3 white-text' : '';
    } catch(e) {
        log.warn('UI: '+e);
        var colormode = '';
    }
    var modalNumber = spawnModal();
    var modal = $('#modal' + modalNumber);
    var command;
    modal.addClass('bottom-sheet');
    modal.openModal({
        dismissible: true, ready: function () {
            $('#modal' + modalNumber + '-content').html('<input id="command" style="width:25%">');
            $('input#command').focus().on('keyup', function(e) {
                if (e.keyCode == 13) {
                    log.debug('UI: Command sent');
                    command = $(this).val().toLowerCase();
                    modal.closeModal();
                    modal.remove();
                    switch(command){
                        case 'kunt.wmv':
                        case 'cunt':
                            YTPlayer('RNGagK4PD7k');
                            break;
                        case 'magnetprobe':
                            YTPlayer('t7xSj9ixnOg');
                            break;
                        case 'penis':
                            YTPlayer('ORdhcgy7F9M');
                            break;
                        case 'magic':
                            if($('script#throwable').length == 0)
                                $('<script src="https://benahm.github.io/jquery.throwable/javascripts/jquery.throwable.js" type="text/javascript" id="throwable"></script> ').appendTo('body');
                            Materialize.toast('Wait for it...', 2000);
                            setTimeout(function () {
                                $('body').css('overflow', 'hidden');
                                $("#timeline > .card.tweet").slice(0, 5).throwable({
                                    gravity:{x:0,y:2},
                                    bounce: 0.5,
                                    collisionDetection: false,
                                    autostart:true
                                });
                            }, 3000);
                            break;
                        case 'jackblackdancelikeabutterfly':
                            YTPlayer('jjdl2Yp6rxk');
                            break;
                        case 'ludger winter':
                            document.styleSheets[0].disabled = true;
                            alert('Hoch entwickeltes Webdesign aktiviert');
                            break;
                        default:
                            log.debug('Client: Invalid command provided');
                            Materialize.toast('Nice try.', 2000);
                            $({deg: 0}).animate({deg: 360}, {
                                duration: 2000,
                                easing: 'easeInOutQuad',
                                step: function(now) {
                                    // in the step-callback (that is fired each step of the animation),
                                    // you can use the `now` paramter which contains the current
                                    // animation-position (`0` up to `angle`)
                                    $('.card').each(function () {
                                        $(this).css({
                                            transform: 'rotate(' + now + 'deg)'
                                        });
                                    })
                                }
                            });
                    }
                }
            });
        }
    });
}

function YTPlayer(id){
    $('<div class="background-container" style="top:0;left:0;position:absolute;z-index:-100;width:100vw;height:100vh;"><div id="player"></div></div>').appendTo('body');
    function makePlayer () {
        player = new YT.Player('player', {
            height: '100%',
            width: '100%',
            videoId: id,
            playerVars: {
                autoplay: 1,
                controls: 0,
                showinfo: 0
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    }
    function onPlayerReady(event) {
        event.target.playVideo();
    }
    function onPlayerStateChange(event) {
        if (event.data === 0) {
            $('.background-container').fadeOut(300, function () {
                $(this).remove()
            })
        }
    }
    if($('script#ytapi').length == 0){
        var player;
        window.onYouTubeIframeAPIReady = makePlayer;
        $('<script id="ytapi" src="https://www.youtube.com/iframe_api"></script>').appendTo('body');
    } else {
        var player;
        makePlayer();
    }
    setTimeout(function () {
        Materialize.toast('Source: <a target="_blank" href="https://youtube.com/watch?v='+id+'"> https://youtube.com/watch?v='+id+'<a/>', 3000);
    }, 5000)
}