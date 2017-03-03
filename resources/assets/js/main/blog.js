if(window.location.pathname.match(/^.*(\/blog)/)){
    $(document).ready(function () {
        var preview = 0;
        $('#newBlog').on('click', function () {
            var modalNumber = spawnModal();
            $('#modal'+ modalNumber).css({
                "width": "85%",
                "height": "80%",
                "max-height": "80%"
            });
            $('#modal' + modalNumber + '-header').text(lang.blog.newpost);
            $('#modal' + modalNumber + '-content').html('<div class="divider"></div><br><div class="row"> <form class="col s5 ajax-form z-depth-2" method="post" action="/api/blog/new"><div class="row"><div class="input-field col s12"><input id="title" name="title" type="text" class="validate"> <label for="title">'+lang.blog.title+'</label></div><div class="input-field col s12"><textarea id="content" class="materialize-textarea" name="content"></textarea><label for="content">'+lang.blog.content+'</label></div><button class="btn waves-effect waves-light blue" type="submit">'+lang.blog.submit+'<i class="material-icons right">send</i> </button> </div> </form><div class="col s6 push-s1 row"><div class="col s12 section z-depth-2"><h3>'+lang.blog.preview+'</h3></div><br><div id="preview" class="col s12"></div></div></div>');
            $('textarea#text').characterCounter();
            preview = 1;
            $('#modal' + modalNumber).openModal({
                dismissible: true,
                opacity: .5,
                ready: setInterval(function(){
                    $.post('/api/blog/preview?lang='+ln, $('#modal' + modalNumber + ' form').serialize(), function(e){
                        $('#preview').html(e);
                        Prism.highlightElement($('#preview p#content')[0])
                    });
                }, 2000),
                complete: function () {
                    $('#modal' + modalNumber).remove();
                    preview = 0;
                }
            });
            $('#modal' + modalNumber + ' form').submit(function (event) {
                event.preventDefault();
                var modalNumber2 = spawnModal();
                var modal = $('#modal' + modalNumber2);
                modal.addClass('bottom-sheet');
                modal.openModal({
                    dismissible: false, ready: function () {
                        $('#modal' + modalNumber2 + '-content').text(lang.external.one_moment);
                        $('#preloader' + modalNumber2).show();
                    }
                });
                var resp = {};
                $.post({
                    url: '/api/blog/new',
                    data: $('#modal' + modalNumber + ' form').serialize(),
                    dataType: 'json',
                    success: function(e){
                        if(e.response === true){
                            $('#modal' + modalNumber2).closeModal();
                            $('#modal' + modalNumber + '-content').empty().html('<b>'+lang.blog.posted+'</b><br><a href="/blog/post/'+e.id+'" class="button btn btn-medium grey">'+lang.blog.show+'</a>');
                        }
                    },
                    async: true
                });
            });
        });
    });
}