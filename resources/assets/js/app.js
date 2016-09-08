(function($){
    $.fn.setCursorToTextEnd = function() {
        var $initialVal = this.val();
        this.val($initialVal);
    };
})(jQuery);
var modalCount = 0,
    upstream = "",
    renderer = "",
    activeID = 0,
    body = document.body,
    html = document.documentElement,
    height = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight ),
    isScrolledDown = false;
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
    ancor.on("click", function (event) {
        event.preventDefault();
        url = $(this).attr("href");
        $("div.section").load(url + "?deliver=raw", function () {
            history.pushState({}, document.title, url);
            window.onpopstate = function (event) {
                $("div.section").load(document.location + "?deliver=raw");
            }
        })
    });
}

function setSize(ancor) {
    var arr = [], max = 0, $elements = $(ancor);
    $elements.each(function() {
        arr.push($(this).offset().top);
    });
    max = Math.max.apply(null, arr);
    $(ancor).height(height - max);
    return true;
}

$(document).ready(function () {
    $('a.ajax-link').click(function (e) {
        e.preventDefault();
        var spinner = ' <div class="preloader-wrapper big active valign"><div class="spinner-layer spinner-blue"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"> <div class="circle"></div> </div><div class="circle-clipper right"> <div class="circle"></div> </div> </div> <div class="spinner-layer spinner-red"> <div class="circle-clipper left"><div class="circle"></div> </div><div class="gap-patch"> <div class="circle"></div> </div><div class="circle-clipper right"> <div class="circle"></div> </div> </div> <div class="spinner-layer spinner-yellow"> <div class="circle-clipper left"> <div class="circle"></div> </div><div class="gap-patch"> <div class="circle"></div> </div><div class="circle-clipper right"> <div class="circle"></div> </div> </div> <div class="spinner-layer spinner-green"> <div class="circle-clipper left"> <div class="circle"></div> </div><div class="gap-patch"> <div class="circle"></div> </div><div class="circle-clipper right"> <div class="circle"></div> </div> </div> </div>';
        $('<div style="z-index: 9999; width: 100%; height: 915px; display: none; position: fixed; background-color: rgba(0, 0, 0, 0.5);" class="loader valign-wrapper">'+spinner+'</div>').prependTo($('body')).fadeIn(300);
        $('body').css('overflow-y', 'hidden');
        var url = $(this).attr("href");
        if(upstream instanceof cDeck){
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
    });
    $('a.popout').click(function(e){
       e.preventDefault();
        MyWindow = window.open($(this).attr('href'),'MyWindow','width=600,height=300');
        return false;
    });

    if (!navigator.cookieEnabled) {
        $('div.section').hide();
        $('#nocookies').show();
    } else {
        $('div.section').show();
    }
    ajaxNav($("a.ajax-link"));
    var errorModal = '';
    setInterval(function () {
        $.ajax({
            type: 'GET', url: '/api/ping', error: function () {
                if(errorModal === ''){
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
    }, 5000);
    if (window.location.pathname == '/') {
        $('body > .section > main').css('position', 'fixed');
        window.client = new cDeck();
            upstream = client.connect();
            $(window).on("beforeunload", function () {
                upstream.close();
        });
        renderer = new Renderer(upstream);
        $('#newTweet').on('click', function () {
            renderer.newTweet(undefined, upstream);
        });
        setSize($('.section .row .col .section > div'));
        $('#timeline').on('scroll', function() {
            if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
                if(isScrolledDown == false){
                    isScrolledDown = true;
                    if(upstream.getTweets($('#timeline > .tweet').last().attr('data-tweet-id'))){
                        isScrolledDown = false;
                    }
                }
            }
        });
        if($(window).width() < 993 ) {
            $('ul.tabs').tabs();
            $('ul.tabs').tabs('select_tab', 'tab2');
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
        shortcut.add("S", function(){$('#search_activate').trigger("click")}, {'disable_in_input':true});
        shortcut.add("N", function(){$('#newTweet').trigger("click")}, {'disable_in_input':true});
        shortcut.add("Ctrl+Enter", function(){$('.modal.open form').trigger("submit")}, {'disable_in_input':false});

    }

});