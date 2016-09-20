(function($){
    $.fn.setCursorToTextEnd = function() {
        var $initialVal = this.val();
        this.val($initialVal);
    };
})(jQuery);

var modalCount;

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
    var spinner = ' <div class="preloader-wrapper big active valign"><div class="spinner-layer spinner-blue"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"> <div class="circle"></div> </div><div class="circle-clipper right"> <div class="circle"></div> </div> </div> <div class="spinner-layer spinner-red"> <div class="circle-clipper left"><div class="circle"></div> </div><div class="gap-patch"> <div class="circle"></div> </div><div class="circle-clipper right"> <div class="circle"></div> </div> </div> <div class="spinner-layer spinner-yellow"> <div class="circle-clipper left"> <div class="circle"></div> </div><div class="gap-patch"> <div class="circle"></div> </div><div class="circle-clipper right"> <div class="circle"></div> </div> </div> <div class="spinner-layer spinner-green"> <div class="circle-clipper left"> <div class="circle"></div> </div><div class="gap-patch"> <div class="circle"></div> </div><div class="circle-clipper right"> <div class="circle"></div> </div> </div> </div>';
    var url = ancor.attr("href");
    $('<div style="z-index: 9999; width: 100%; height: 915px; display: none; position: fixed; background-color: rgba(0, 0, 0, 0.5);" class="loader valign-wrapper">'+spinner+'</div>').prependTo($('body')).fadeIn(300);
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
                $.when($('.loader').remove()).then(window.eval($siteCode));
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
function changeUconfig(params){
    var a = {};
    $.post({
        url: '/api/uconfig',
        data: params,
        success: function(data){
            a = data;
            uconfig = data.data
        },
        dataType: 'json',
        async: false
    });
    return a.response
}