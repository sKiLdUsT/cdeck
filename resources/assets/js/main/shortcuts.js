$(function () {
    if ( window.location.pathname == '/' ) {
        shortcut.add("S", function(){$('#search_activate').trigger("click")}, {'disable_in_input':true});
        shortcut.add("N", function(){$('#newTweet').trigger("click")}, {'disable_in_input':true});
        shortcut.add("Ctrl+Enter", function(){$('.modal.open form').trigger("submit")}, {'disable_in_input':false});
    }
});