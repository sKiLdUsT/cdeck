var modalCount = 0,
    upstream = "",
    renderer = "",
    activeID = 0;
function ajaxForm(form, modal2) {
    var modalNumber = spawnModal();
    var modal = $('#modal' + modalNumber);
    form.submit(function (event) {
        event.preventDefault();
        modal.addClass('bottom-sheet');
        modal.openModal({
            dismissible: false, ready: function () {
                $('#modal' + modalNumber + '-content').text('Einen Moment...');
                $('#preloader' + modalNumber).show();
            }
        });
        var formData = form.serialize();
        $.ajax({
            type: 'POST',
            url: form.attr('action'),
            data: formData,
            dataType: 'json',
            success: function (response) {
                modal.closeModal();
                $('#modal' + modal2).closeModal();
                console.log(response);
            },
            error: function (response) {
                modal.closeModal();
                modal.removeClass('bottom-sheet');
                console.log(response);
            }
        })
    })
}
function spawnModal() {
    modalCount++;
    var modal = '<div id="modal' + modalCount + '" class="modal">\
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
        <div class="modal-footer" id="modal-footer">\
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

$(document).ready(function () {
    if (!navigator.cookieEnabled) {
        $('div.section').hide();
        $('#nocookies').show();
    } else {
        $('div.section').show();
    }
    ajaxNav($("a.ajax-link"));
    var errorModal = '';
    setInterval(function () {
        Pace.ignore(function () {
            $.ajax({
                type: 'GET', url: '/api/debug/ping', error: function () {
                    if(errorModal === ''){
                        errorModal = spawnModal();
                        var modal = $('#modal' + errorModal);
                        modal.addClass('bottom-sheet');
                        modal.openModal({
                            dismissible: false, ready: function () {
                                $('#modal' + errorModal + '-content').text('Wir räumen etwas auf, einen Moment bitte...');
                                $('#preloader' + errorModal).show();
                            }
                        });
                        throw new CDeckError('Application in maintenance mode')
                    }
                }, success: function(){
                    if(errorModal !== '') {
                        $('#modal' + errorModal + '-content').text('Einen Moment...');
                        location.reload();
                    }
                }
            })
        })
    }, 5000);
    if (window.location.pathname == '/') {
        $('body > .section > main').css('position', 'fixed');
        var client = new cDeck();
        Pace.ignore(function () {
            upstream = client.connect();
            $(window).on("beforeunload", function () {
                upstream.close();
            });
        });
        renderer = new Renderer(upstream);
        $('#newTweet').on('click', function () {
            renderer.newTweet();
        });
        $('a.changeTl').on('click', function () {
            if($(this).attr('data-id') != activeID){
                upstream.close();
                $('#pb').attr('src', $(this).children('img').attr('src'));
                upstream = client.connect($(this).attr('data-id'));
                activeID = $(this).attr('data-id');
            }else{
                throw new CDeckError("ID already active");
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
        });
        $(".button-collapse").sideNav({menuWidth: 300});
    }
});