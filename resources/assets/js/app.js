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

var modalCount = 0;
function spawnModal() {
    modalCount++;
    var modal = '<div id="modal' + modalCount + '" class="modal">\
        <div class="wrapper">\
        <div class="modal-content">\
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
    setInterval(function () {
        Pace.ignore(function () {
            $.ajax({
                type: 'GET', url: '/api/debug/ping', error: function () {
                    location.reload()
                }
            })
        })
    }, 10000);
    if (window.location.pathname == '/') {
        $('body > .section > main').css('position', 'fixed');
        var renderer = new Renderer();
        var client = new cDeck();
        Pace.ignore(function () {
            var upstream = client.connect();
            $(window).bind("beforeunload", function () {
                upstream.close();
            });
        });
        function testTl() {
            data = ({
                "text": "debug-test",
                "id": 0,
                "user": {
                    "profile_image_url_https": 0,
                    "name": "Debug"
                },
                "entities": {}
            });
            renderer.display(data);
        }

        $('#newTweet').on('click', function () {
            renderer.newTweet()
        });
    }
});