$(document).ready(function () {
    $('#button_voice').click(function(e){
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
                    $('#recorded a#send').click(function () {
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
                    $('#play').click(function(e){
                        e.preventDefault();
                        if($(this).hasClass('playing')){
                            wavesurfer.playPause()
                        }else{
                            $(this).addClass('playing');
                            wavesurfer.play()
                        }
                    });
                    $('#stop').click(function(e){
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
        $('.btn#voice').click(function (e) {
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
    $('#button_nightmode').click(function(e){
        e.preventDefault();
        var body = $('body');
        var headline = $('h4 > i');
        if(body.hasClass('lighten-2')){
            body.removeClass('lighten-2').addClass('darken-3');
            headline.addClass('white-text');
            changeUconfig({colormode: 1});
        }else{
            body.removeClass('darken-3').addClass('lighten-2');
            headline.removeClass('white-text');
            changeUconfig({colormode: 0});
        }
    });
    $('#button_map').click(function(e){
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
        $('#modal' + mn + '-content').html('<iframe name="map" scrolling="no" width="100%" height="500px" style="border: 5px solid aliceblue;" src="https://kontrollraum.org"></iframe>');
    });
    $('#button_notifications').click(function(e){
        e.preventDefault();
        if(notify.isSupported !== true){
            throw new CDeckError('Browser not supported');
        }
        if(notify.permissionLevel() != notify.PERMISSION_GRANTED){
            if(notify.permissionLevel() == notify.PERMISSION_DENIED){
                Materialize.toast('Verweigert! Bitte erlaube cDeck in deinen Browser-Einstellungen, diese Funktion zu nutzen.', 5000);
                throw new CDeckError('No Permission to access notifications. Result was: '+notify.permissionLevel())
            }
            notify.requestPermission(function(response){
                if(response != notify.PERMISSION_GRANTED){
                    Materialize.toast('Verweigert! Bitte erlaube cDeck in deinen Browser-Einstellungen, diese Funktion zu nutzen.', 5000);
                    throw new CDeckError('No Permission to access notifications. Result was: '+notify.permissionLevel())
                }
            })
        }
        if(changeUconfig({notifications: true}) === true){
            notify.createNotification("cDeck", {body:"Notifications enabled!", icon: "assets/img/logo.png"})
        }
    });
    $('#button_settings').click(function(e){
        e.preventDefault();
    });
    $('#button_language').click(function(e){
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
                $(this).remove()
            }
        });
        $('#modal' + mn + ' form').submit(function (event) {
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
            if(changeUconfig($(this).serialize()) === true){
                location.reload();
            }else{
                modal.closeModal();
                $('#modal'+mn).closeModal();
                throw new CDeckError('Setting language failed')
            }
        });
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
    $('.dropdown-button').dropdown({constrain_width: false, belowOrigin: true});
    $('#search_activate').click(function (e){
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
    $(".button-collapse").sideNav({menuWidth: 300});
});