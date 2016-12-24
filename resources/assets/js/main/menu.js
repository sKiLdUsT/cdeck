$(function () {
    $('a#button_voice').on('click', function(e){
        e.preventDefault();
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        URL = window.URL || window.webkitURL;
        var mn = spawnModal(),
            audioContext = new AudioContext,
            mixer = audioContext.createGain(),
            spinner = ' <div class="preloader-wrapper big active valign"><div class="spinner-layer spinner-blue"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"> <div class="circle"></div> </div><div class="circle-clipper right"> <div class="circle"></div> </div> </div> <div class="spinner-layer spinner-red"> <div class="circle-clipper left"><div class="circle"></div> </div><div class="gap-patch"> <div class="circle"></div> </div><div class="circle-clipper right"> <div class="circle"></div> </div> </div> <div class="spinner-layer spinner-yellow"> <div class="circle-clipper left"> <div class="circle"></div> </div><div class="gap-patch"> <div class="circle"></div> </div><div class="circle-clipper right"> <div class="circle"></div> </div> </div> <div class="spinner-layer spinner-green"> <div class="circle-clipper left"> <div class="circle"></div> </div><div class="gap-patch"> <div class="circle"></div> </div><div class="circle-clipper right"> <div class="circle"></div> </div> </div> </div>',
            vtimeout, vtimer, vtcount, audioRecorder,
            inputPoint, realAudioInput, audioInput, zeroGain;

        if (audioContext.createScriptProcessor == null) {
            audioContext.createScriptProcessor = audioContext.createJavaScriptNode;
        }

        navigator.getUserMedia(
            {
                "audio": {
                    "mandatory": {
                        "googEchoCancellation": "false",
                        "googAutoGainControl": "false",
                        "googNoiseSuppression": "false",
                        "googHighpassFilter": "false"
                    },
                    "optional": []
                }
            }, onAudio , function(e) {
                alert('Error getting audio');
                console.log(e);
            }
        );

        function onAudio (stream) {
            inputPoint = audioContext.createGain();

            realAudioInput = audioContext.createMediaStreamSource(stream);
            audioInput = realAudioInput;
            audioInput.connect(inputPoint);

            zeroGain = audioContext.createGain();
            zeroGain.gain.value = 0.0;
            inputPoint.connect( zeroGain );
            zeroGain.connect( audioContext.destination );

            audioRecorder = new WebAudioRecorder(inputPoint, {
                workerDir: 'assets/js/worker/',
                encoding: 'mp3',
                options: {
                    timeLimit: 15,
                    encodeAfterRecord: true,
                    progressInterval: 10,
                    mp3: {
                        bitRate: 128
                    }
                },
                onEncoderLoaded: function () {
                    $('.loader').fadeOut(function () {
                        $('.loader').remove();
                    })
                },
                onEncodingProgress: function (recorder, progress) {
                    $('#recorded .progress .determinate').width((progress * 100) + '%')
                },
                onComplete: function (recorder, blob) {
                    window.$voiceblob = blob;
                    if ($('#recorded').length !== 0) {
                        $('#recorded').remove()
                    }
                    $('<div class="row section z-depth-2" id="recorded" style="display:none"><blockquote class="col s12"><div id="voice-preview"></div><div class="controls center-align col s12"> <a id="play" class="btn waves-effect"><i class="material-icons">play_arrow</i>/<i class="material-icons">pause</i></a> <a id="stop" class="btn waves-effect"><i class="material-icons">stop</i></a> </div></blockquote><a class="btn" id="send">' + lang.menu.send + '</a></div></div>').appendTo($('#modal' + mn + '-content')).fadeIn(400);
                    $('#recorded a#send').on('click', function () {
                        $('.lean-overlay').trigger('click');
                        $('#newTweet').trigger('click');
                    });
                    var wavesurfer = WaveSurfer.create({
                        container: '#voice-preview',
                        waveColor: 'blue',
                        progressColor: 'red',
                        backgroundColor: '#333333',
                        barWidth: '3',
                        normalize: true
                    });
                    wavesurfer.load(window.URL.createObjectURL($voiceblob));
                    wavesurfer.on('finish', function () {
                        $('#play').removeClass('playing')
                    });
                    $('#play').on('click', function(e){
                        e.preventDefault();
                        if($(this).hasClass('playing')){
                            wavesurfer.playPause()
                        }else{
                            $(this).addClass('playing');
                            wavesurfer.play()
                        }
                    });
                    $('#stop').on('click', function(e){
                        e.preventDefault();
                        if($('#play').hasClass('playing')){
                            wavesurfer.stop();
                            $(this).removeClass('playing')
                        }
                    })
                }
            });
        }

        $('#modal' + mn + '-header').text(lang.menu.voice);
        $('#modal'+mn+' > .wrapper').children('modal-footer').remove();
        $('#modal'+mn).css('overflow-y', 'hidden');
        $('#modal'+mn).openModal({
            dismissible: true,
            opacity: .5,
            ready: function(){
                $('#modal'+mn).css("overflow-y", "auto");
                $('<div style="z-index: 9999; width: 100%; height: 915px; display: none; position: fixed; background-color: rgba(0, 0, 0, 0.5);" class="loader valign-wrapper">' + spinner + '</div>').prependTo($('body')).fadeIn(300);
            },
            complete: function () {
                $('#modal'+mn).remove();
            }
        });
        $('#modal' + mn + '-content').html('<div class="row center"><div class="col s12 section z-depth-2"><a class="btn" id="voice"><i class="material-icons">fiber_manual_record</i></a>  <b id="timer" style="display:none"></b></div></div>');
        $('.btn#voice').on('click', function (e) {
            if($(this).hasClass('recording')) {
                audioRecorder.finishRecording();
                $(this).removeClass('recording');
                clearTimeout(vtimeout);
                setTimeout(function () {
                    clearInterval(vtimer)
                }, 100);
                $('.btn#voice').removeClass('red').fadeIn();
                if ($('#recorded').length !== 0) {
                    $('#recorded').remove()
                }
                $('<div class="row section z-depth-2" id="recorded" style="display:none"><div class="col s12"> <div class="progress"> <div class="determinate"></div> </div> </div><div class="col s12">Encoding...</div></div>').appendTo($('#modal' + mn + '-content')).fadeIn(400);
            }else{
                $(this).addClass('recording');
                $('.btn#voice').addClass('red').fadeIn();
                audioRecorder.startRecording();
                vtcount = 1;
                vtimeout = setTimeout(function(){$('.btn#voice').trigger('click')}, 15000);
                $('b#timer').fadeIn().text('00:00');
                vtimer = setInterval(function(){
                    var sec_num = parseInt(vtcount, 10);
                    var hours   = Math.floor(sec_num / 3600);
                    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
                    var seconds = sec_num - (hours * 3600) - (minutes * 60);
                    if (minutes < 10) {minutes = "0"+minutes;}
                    if (seconds < 10) {seconds = "0"+seconds;}
                    $('b#timer').text(minutes+':'+seconds);
                    vtcount++
                }, 1000);
            }
        })
    });
    $('a#button_nightmode').on('click', function(e){
        e.preventDefault();
        var sel = $('.grey');
        var tweets = $('.blue-grey');
        var headline = $('h4 > i');
        sel.each(function(){
            if($(this).hasClass('lighten-2')){
                $(this).removeClass('lighten-2').addClass('darken-3');
                $(this).addClass('white-text').removeClass('black-text');
            }else{
                $(this).removeClass('darken-3').addClass('lighten-2');
                $(this).removeClass('white-text').addClass('black-text');
            }
        });
        tweets.each(function(){
            if($(this).hasClass('lighten-2')){
                $(this).removeClass('lighten-2').addClass('darken-4');
            }else{
                $(this).removeClass('darken-4').addClass('lighten-2');
            }
        });
        if(headline.hasClass('white-text')){
            headline.removeClass('white-text');
            changeUconfig({colormode: 0});
        } else {
            headline.addClass('white-text');
            changeUconfig({colormode: 1});
        }
    });
    $('a#button_map').on('click', function(e){
        e.preventDefault();
        var mn = spawnModal();
        $('#modal' + mn + '-header').text('Kontrollraum Twitter-Map');
        $('#modal'+mn+' > .wrapper').children('modal-footer').remove();
        $('#modal'+mn).css('overflow-y', 'hidden');
        $('#modal'+mn).openModal({
            dismissible: true,
            opacity: .5,
            complete: function () {
                $(this).remove()
            }
        });
        $('#modal' + mn + '-content').html('<iframe name="map" class="z-depth-2" scrolling="no" width="100%" height="100%" style="border: 0 solid;" src="//map.kontrollraum.org"></iframe>');
    });
    $('a#button_notifications').on('click', function(e){
        e.preventDefault();
        var Notify = window.Notify.default;
        if(window.uconfig.notifications == "false"){
            if(Notify.needsPermission && Notify.isSupported()){
                Notify.requestPermission(onPermissionGranted, onPermissionDenied);
            } else if(Notify.isSupported()) {
                changeUconfig({notifications: true}, function(result){
                    if(result === true){
                        Materialize.toast(lang.menu.noti_enabled, 5000)
                    }
                });
            } else {
                Materialize.toast('Unsupported');
                console.warn('cDeck: Notifications unsupported');
            }
            function onPermissionGranted() {
                changeUconfig({notifications: true}, function(result){
                    if(result === true){
                        Materialize.toast(lang.menu.noti_enabled, 5000)
                    }
                });
            }
            function onPermissionDenied() {
                console.warn('cDeck: Notification permission denied');
                Materialize.toast('Permission denied');
            }
        }else{
            changeUconfig({notifications: false}, function(result){
                if(result === true){
                    Materialize.toast(lang.menu.noti_disabled, 5000)
                }
            });

        }
    });
    $('a#button_settings').on('click', function(e){
        e.preventDefault();
        var mn = spawnModal(),
            colormode = uconfig.colormode == "1" ? 'grey darken-2 white-text' : '',
            setting = {
                roundpb: uconfig.roundpb == "true" ? 'checked="checked"' : ''
            };
        $('#modal' + mn + '-header').text(lang.menu.settings);
        $('#modal' + mn + '-content').html('<ul class="tabs '+colormode+'"><li class="tab col s4"><a class="active" href="#settings_ui">UI</a></li><li class="tab col s4"><a href="#settings_about">About</a></li></ul><div id="settings_ui" class="container"><form id="settings"><p><input type="checkbox" class="filled-in" id="round-pb" '+ setting.roundpb +' /> <label for="round-pb">Round Profile Pictures</label></p></form></p></div><div id="settings_about" class="container" style="display: none"><h3>cDeck Web Client</h3><p>Client Build: '+$app.version+'</p><p><a target="_blank" href="//github.com/cDeckTeam/cdeck-client.js">cDeck API Client</a> Version: '+cDeck.version+'</p><p>©2016-2017 cDeck Team / <a target="_blank" href="//kontrollraum.org">Kontrollraum.org</a></p><div class="divider"></div><p><a target="_blank" href="/imprint">'+lang.disclaimer.imprint+'</a></p><p><a target="_blank" href="/privacy">'+lang.privacy.this+'</a></p></div>');
        $('#modal' + mn + '-content').children('div.container').css({margin: '2em auto'});
        $('#modal'+mn).openModal({
            dismissible: true,
            opacity: .5,
            ready:function(){
                $('#modal'+ mn + '-content').children('ul.tabs').tabs();
                $('#modal'+ mn + '-content form').children('#round-pb').on('change', function(){
                    if($(this).attr('checked') == 'checked'){
                        changeUconfig({roundpb: false}, function(result){
                            if(result === true){
                                $(this).removeAttr('checked');
                                $('img.pb').removeClass('circle')
                            }
                        });
                    } else {
                        changeUconfig({roundpb: true}, function(result){
                            if(result === true){
                                $(this).attr('checked', 'checked');
                                $('img.pb').addClass('circle')
                            }
                        });
                    }
                });
            },
            complete: function () {
                $('#modal'+mn).remove()
            }
        });
        $('#settings input[type="checkbox"]').on('click', function (event) {
            var id = $(this).attr('id').replace('-',''),
                value = $(this).is(':checked');
            changeUconfig({[id]: value}, function(result){
                if(result === true){
                    switch(id){
                        case 'roundpb':
                            if(value){
                                $('img.responsive-img').addClass('circle')
                            } else {
                                $('img.responsive-img').removeClass('circle')
                            }
                    }
                }
            });
        });
    });
    $('a#button_language').on('click', function(e){
        e.preventDefault();
        var mn = spawnModal();
        $('#modal' + mn + '-header').text(lang.menu.lang);
        $('#modal'+mn+' > .wrapper').children('modal-footer').remove();
        $('#modal'+mn).css('overflow-y', 'hidden');
        $('#modal' + mn + '-content').html('<form><div class="input-field col s12"> <select name="lang"> <option value="" disabled selected>'+lang.message.preflang+'</option><option value="en">English</option> <option value="de">Deutsch</option> <option value="fr">Français</option></select><label>'+lang.menu.lang+'</label></div><button class="btn waves-effect waves-light blue" type="submit"><i class="material-icons right">send</i> </button></form>');
        $('select').material_select();
        $('#modal'+mn).openModal({
            dismissible: true,
            opacity: .5,
            complete: function () {
                $('#modal'+mn).remove()
            }
        });
        $('#modal' + mn + ' form').on('submit', function (event) {
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
            changeUconfig($(this).serialize(), function(result){
                if(result === true){
                    location.reload();
                }else{
                    modal.closeModal();
                    $('#modal'+mn).closeModal();
                    throw new CDeckError('Setting language failed')
                }
            });
        });
    });

    $('a.changeTl').on('click', function () {
        if($(this).attr('data-id') != $app.activeID){
            cDeck.close();
            $('.card.tweet').remove();
            $('#timeline').children('div.divider').remove().html('<div class="divider"></div>');
            $('#timeline, #notifications').children('.preloader-wrapper').show();
            $('#pb').attr('src', $(this).children('img').attr('src'));
            cDeck.init({
                tconfig_url: $app.tconfig_url,
                uconfig_url: $app.uconfig_url,
                lang_url: $app.lang_url,
                upstream_url: $app.upstream_url,
                user_url: $app.user_url
            },cDeckInit);
            $app.activeID = $(this).attr('data-id');
            cDeck.connect($app.activeID);
            changeUconfig({activeID: $app.activeID});
        }else{
            throw new CDeckError("ID already active");
        }

    });
    $('a#button_remacc').on('click', function(e){
        e.preventDefault();
        var mn = spawnModal();
        var accounts = $('a.changeTl').clone().removeClass('changeTl').addClass('btn-large red').css({margin: '0 5px'});
        accounts.each(function(){
            $(this).attr('href', '/api/rmacc/' + $(this).attr('data-id'))
        });
        $('#modal' + mn + '-header').text(lang.message.remacc);
        $('#modal'+mn).css('overflow-y', 'hidden');
        $('#modal' + mn + '-content').html(accounts);
        $('#modal'+mn).openModal({
            dismissible: true,
            opacity: .5,
            complete: function () {
                $('#modal'+mn).remove()
            }
        });
    });
    $('.dropdown-button').dropdown({constrain_width: false, belowOrigin: true});
    $('#search_activate').on('click', function (e){
        if(e !== undefined){
            e.preventDefault();
        }
        var search = $(this);
        $(this).hide();
        $(search.parent()).children('form').fadeIn();
        $(search.parent()).find('input').focus();
    });
    $($('#search_activate').parent()).find('input').blur(function(){
        ($($('#search_activate').parent()).children('form').fadeOut());
        setTimeout(function(){$('#search_activate').show()}, 350);
    });
    $('.collapsible').collapsible();
});