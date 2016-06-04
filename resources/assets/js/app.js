function login(ancor) {
    var form = ancor;
    $(form).submit(function (event) {
        event.preventDefault();
        //showPopup(1);
        $('#modal1').openModal({
            dismissible: false, complete: function () {
                $('#popup-text').text(btntext);
                $('.preloader-wrapper').show();
                $('.modal-close').hide();
            }
        });
        var formData = $(form).serialize();
        setTimeout(function () {
            $.ajax({
                type: 'POST',
                url: $(form).attr('action'),
                data: formData,
                dataType: 'json',
                success: function (response) {
                    $("#popup-text").text("Lade...");
                    $("div.section").load(response.location, function () {
                        $('#modal1').closeModal();
                    });
                },
                error: function (response) {
                    error = getJSON(response.responseText);
                    $('.preloader-wrapper').hide();
                    $("#popup-text").text("Oops! Da ist was schief gelaufen.").text(response.email);
                    console.log(error);
                    $('.modal-close').show();
                }
            })
        }, 2000)
    })
}

function ajaxNav(ancor){
    $(ancor).on("click",function(event){
        event.preventDefault();
        url = $(this).attr("href");
        $("div.section").load(url + "?deliver=raw", function(){
            history.pushState({}, document.title, url);
            window.onpopstate = function(event) {
                $("div.section").load(document.location + "?deliver=raw");
            }
        })
    });
}

$(document).ready(function () {
   ajaxNav($("a.ajax-link"));
    login($("form.ajax-form"))
});