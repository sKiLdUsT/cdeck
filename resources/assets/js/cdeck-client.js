var cDeck = function () {
    this.host = location.host + ':24789';
    this.renderer = new Renderer();
};
cDeck.prototype.connect = function () {
    var socket = io(this.host);
    var data = Object;
    var renderer = this.renderer;
    $.ajax({
        url: 'http://dev.cdeck.net/api/twitter/getToken',
        async: false,
        dataType: 'json',
        success: function(response){data = response}
    });
    console.log(data);
    socket.emit('register', data, function (response) {
        if (response == false) {
           renderer.failed("Registrierung am Server gescheitert");
           throw new Error("Socket connection failed.")
        }
    });
    this.socket = socket;
    this.socket.on('timeline', function (data){
        renderer.display(data)
    });
    return this
};
cDeck.prototype.close = function () {
    if (this.socket) {
        this.socket.close()
    }
    return this
};

var Renderer = function(){};
Renderer.prototype.display = function(data){
    $('#timeline').prepend('<div class="divider"></div><div class="card blue-grey darken-1 timeline"> <div class="card-content white-text"> <span class="card-title left-align"><img src="'+ data.user.profile_image_url_https +'" alt="Profilbild" class="circle responsive-img">' + data.user.screen_name + '</span> <p>'+data.text+'</p> </div> <div class="card-action"> <a href="#">This is a link</a> <a href="#">This is a link</a></div></div>');
    $('div.timeline').addClass('.card .timeline.show');
    console.log("New Event added");
    console.log(data);
};
Renderer.prototype.failed = function(reason){
    console.log(reason);
};