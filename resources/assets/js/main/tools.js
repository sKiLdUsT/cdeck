(function($){
    $.fn.setCursorToTextEnd = function() {
        var $initialVal = this.val();
        this.val($initialVal);
    };
})(jQuery);

var modalCount = 0;

function spawnModal() {
    modalCount++;
    var colormode = uconfig.colormode == "1" ? 'grey darken-3 white-text' : '';
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
        if(uconfig.debugmode)
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
    },
};