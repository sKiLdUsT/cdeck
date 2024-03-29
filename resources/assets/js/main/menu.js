function homeMenu() {
    /*$('a#button_voice').on('click', function(e){
     log.debug('UI: "#button_voice" clicked');
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
     });*/
    $('a#button_nightmode').on('click', function (e) {
        log.debug('UI: "#button_nightmode" clicked');
        e.preventDefault();
        var sel = $('.grey');
        var tweets = $('.blue-grey');
        var headline = $('h4 > i');
        sel.each(function () {
            if ($(this).hasClass('lighten-2')) {
                $(this).removeClass('lighten-2').addClass('darken-3');
                $(this).addClass('white-text').removeClass('black-text');
            } else {
                $(this).removeClass('darken-3').addClass('lighten-2');
                $(this).removeClass('white-text').addClass('black-text');
            }
        });
        tweets.each(function () {
            if ($(this).hasClass('lighten-2')) {
                $(this).removeClass('lighten-2').addClass('darken-4');
            } else {
                $(this).removeClass('darken-4').addClass('lighten-2');
            }
        });
        if (headline.hasClass('white-text')) {
            headline.removeClass('white-text');
            changeUconfig({colormode: 0});
        } else {
            headline.addClass('white-text');
            changeUconfig({colormode: 1});
        }
    });
    $('a#button_map').on('click', function (e) {
        log.debug('UI: "#button_map" clicked');
        e.preventDefault();
        var mn = spawnModal();
        $('#modal' + mn + '-header').text('Kontrollraum Twitter-Map');
        $('#modal' + mn + ' > .wrapper').children('modal-footer').remove();
        $('#modal' + mn).css('overflow-y', 'hidden');
        $('#modal' + mn).openModal({
            dismissible: true,
            opacity: .5,
            complete: function () {
                $(this).remove()
            }
        });
        $('#modal' + mn + '-content').html('<iframe name="map" class="z-depth-2" scrolling="no" width="100%" height="100%" style="border: 0 solid;height:50vh;" src="//map.kontrollraum.org"></iframe>');
    });
    $('a#button_notifications').on('click', function (e) {
        log.debug('UI: "#button_notifications" clicked');
        e.preventDefault();
        if (window.uconfig.notifications == "false") {
            if (!("Notification" in window)) {
                alert("This browser does not support desktop notification");
            }
            else if (Notification.permission === "granted") {
                changeUconfig({notifications: true}, function (result) {
                    if (result === true) {
                        log.info('Client: Notifications enabled');
                        Materialize.toast(lang.menu.noti_enabled, 5000)
                    }
                });
            }
            else if (Notification.permission !== 'denied') {
                Notification.requestPermission(function (permission) {
                    if (permission === "granted") {
                        changeUconfig({notifications: true}, function (result) {
                            if (result === true) {
                                log.info('Client: Notifications enabled');
                                Materialize.toast(lang.menu.noti_enabled, 5000)
                            }
                        });
                    }
                });
            }
            else if (Notification.permission === 'denied') {
                log.info('Client: Notifications denied');
                Materialize.toast('Permission denied by user', 5000)
            }
        } else {
            changeUconfig({notifications: false}, function (result) {
                if (result === true) {
                    log.info('Client: Notifications disabled');
                    Materialize.toast(lang.menu.noti_disabled, 5000)
                }
            });

        }
    });
    $('a#button_settings').on('click', function (e) {
        log.debug('UI: "#button_settings" clicked');
        e.preventDefault();
        var mn = spawnModal(),
            colormode = uconfig.colormode == "1" ? 'grey darken-2 white-text' : '',
            setting = {
                roundpb: uconfig.roundpb ? 'checked="checked"' : '',
                debugmode: uconfig.debugmode ? 'checked="checked"' : '',
                minimal: uconfig.minimal ? 'checked="checked"' : ''
            };
        $('#modal' + mn + '-header').text(lang.menu.settings);
        $('#modal' + mn + '-content').html('<form id="settings"><ul class="tabs ' + colormode + '"><li class="tab col s4"><a class="active" href="#settings_ui" id="ui">UI</a></li><li class="tab col s4"><a href="#settings_client">Client</a></li><li class="tab col s4"><a href="#settings_about">About</a></li></ul><div id="settings_ui" class="container"><p><input type="checkbox" class="filled-in" id="round-pb" ' + setting.roundpb + ' /> <label for="round-pb">Round Profile Pictures</label></p><p><input type="checkbox" class="filled-in" id="minimal" ' + setting.minimal + ' /> <label for="minimal">Minimal Tweet Cards</label></p><p><div class="file-field input-field"> <div class="btn"> <span>Change local background</span> <input type="file" id="settings-bg"> </div> <div class="file-path-wrapper hidden"><input class="file-path validate" type="text"></div></div></p></div><div id="settings_client" class="container"><p><input type="checkbox" class="filled-in" id="debug-mode" ' + setting.debugmode + ' /> <label for="debug-mode">Debug Mode</label></p></div><div id="settings_about" class="container" style="display: none"><h3>cDeck Web Client</h3><p>Client Build: ' + $app.version + ' <a href="#!" onclick="showHighlights()">(Highlights)</a></p><p><a target="_blank" href="//github.com/cDeckTeam/cdeck-client.js">cDeck API Client</a> Version: ' + cDeck.version + '</p><p>©2016-2017 cDeck Team / <a target="_blank" href="//kontrollraum.org">Kontrollraum.org</a></p><p><button class="btn waves-effect waves-light blue" id="donate"><img class="left" src="/assets/img/pp.png">Donate</button></p><div class="divider"></div><p><a target="_blank" href="/imprint">' + lang.menu.imprint + '</a></p><p><a target="_blank" href="/privacy">' + lang.menu.privacy + '</a></p></div></form>');
        $('#modal' + mn + '-content').children('div.container').css({margin: '2em auto'});
        $('#modal' + mn).openModal({
            dismissible: true,
            opacity: .5,
            ready: function () {
                var form = $('#modal' + mn + '-content form');
                form.children('ul.tabs').tabs();
            },
            complete: function () {
                $('#modal' + mn).remove()
            }
        });
        $('#donate').on('click', function (e) {
            e.preventDefault();
            $('form#donate_form').trigger('submit');
        });
        $('#settings input[type="checkbox"]').on('click', function (event) {
            var id = $(this).attr('id').replace('-', ''),
                value = !!$(this).is(':checked'),
                object = {};
            object[id] = value;
            changeUconfig(object, function (result) {
                if (result === true) {
                    switch (id) {
                        case 'roundpb':
                            if (value) {
                                $('img.responsive-img').addClass('circle')
                            } else {
                                $('img.responsive-img').removeClass('circle')
                            }
                            break;
                        case 'debugmode':
                            if (value) {
                                log.info('Client: Debug Mode enabled')
                            } else {
                                log.info('Client: Debug Mode disabled')
                            }
                            break;
                        case 'minimal':
                            if (value) {
                                $(this).attr('checked', 'checked');
                                $('.card.tweet').addClass('minimal')
                            } else {
                                $(this).removeAttr('checked');
                                $('.card.tweet').removeClass('minimal')
                            }
                            break;
                    }
                }
            });
        });
        $('#settings-bg').on('change', function (event) {
            event.preventDefault();
            var reader = new FileReader();
            reader.readAsDataURL($(this)[0].files[0]);
            reader.onload = function () {
                if (typeof(Storage) !== "undefined") {
                    localStorage.setItem("background", reader.result);
                    $('body').css('background-image', 'url(' + reader.result + ')')
                } else {
                    throw new CDeckError('Missing localStorage support')
                }
            };
            reader.onerror = function (error) {
                log.error(error);
            };
        });

    });
    $('a#button_language').on('click', function (e) {
        log.debug('UI: "#button_language" clicked');
        e.preventDefault();
        var mn = spawnModal();
        $('#modal' + mn + '-header').text(lang.menu.lang);
        $('#modal' + mn + ' > .wrapper').children('modal-footer').remove();
        $('#modal' + mn).css('overflow-y', 'hidden');
        $('#modal' + mn + '-content').html('<form><div class="input-field col s12"> <select name="lang"> <option value="" disabled selected>' + lang.message.preflang + '</option><option value="en">English</option> <option value="de">Deutsch</option> <option value="fr">Français</option></select><label>' + lang.menu.lang + '</label></div><button class="btn waves-effect waves-light blue" type="submit"><i class="material-icons right">send</i> </button></form>');
        $('select').material_select();
        $('#modal' + mn).openModal({
            dismissible: true,
            opacity: .5,
            complete: function () {
                $('#modal' + mn).remove()
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
            changeUconfig($(this).serialize(), function (result) {
                if (result === true) {
                    location.reload();
                } else {
                    modal.closeModal();
                    $('#modal' + mn).closeModal();
                    throw new CDeckError('Setting language failed')
                }
            });
        });
    });

    $('a.changeTl').on('click', function () {
        log.debug('UI: ".changeTl" clicked');
        if ($(this).attr('data-id') != $app.activeID) {
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
            }, cDeckInit);
            $app.activeID = $(this).attr('data-id');
            cDeck.connect($app.activeID);
            changeUconfig({activeID: $app.activeID});
        } else {
            throw new CDeckError("ID already active");
        }

    });
    $('a#button_remacc').on('click', function (e) {
        log.debug('UI: "#button_remacc" clicked');
        e.preventDefault();
        var mn = spawnModal();
        var accounts = $('a.changeTl').clone().removeClass('changeTl').addClass('btn-large red').css({margin: '0 5px'});
        accounts.each(function () {
            $(this).attr('href', '/api/rmacc/' + $(this).attr('data-id'))
        });
        $('#modal' + mn + '-header').text(lang.message.remacc);
        $('#modal' + mn).css('overflow-y', 'hidden');
        $('#modal' + mn + '-content').html(accounts);
        $('#modal' + mn).openModal({
            dismissible: true,
            opacity: .5,
            complete: function () {
                $('#modal' + mn).remove()
            }
        });
    });

    $('#button_dm').on('click', function(e){
        e.preventDefault();
        var mn = spawnModal();
        $('#modal' + mn + '-header').text("Direct Messages");
        $('#modal' + mn + '-content').html(preloader(true));
        $('#modal' + mn).css('overflow', 'hidden').openModal({
            dismissible: true,
            opacity: .5,
            complete: function () {
                $('#modal' + mn).remove()
            }
        });
        if($app.chats[cDeck.user.screen_name] === undefined){
            cDeck.getDMs(afterLoad);
        } else {
            afterLoad();
        }
        function afterLoad(){
            var chats = $app.chats[cDeck.user.screen_name], user = '', content, count = 0;
            $.each( chats, function(key, value){
                var pb, name;
                value.every(function(data){
                    if(data.align == 'left'){
                        pb = data.user.profile_image_url_https;
                        name = data.user.name;
                        return false;
                    }
                    return true;
                });
                if(typeof pb == "undefined" || typeof name == "undefined"){
                    cDeck.getUserInfo(key, function(data){
                        user = '<div class="card-panel grey darken-2 dm-user" data-handle="'+key+'"><img class="responsive-img circle" src="'+data.profile_image_url_https+'">'+data.name+'</div>' + user;
                        count++;
                    });
                } else {
                    user = '<div class="card-panel grey darken-2 dm-user" data-handle="'+key+'"><img class="responsive-img circle" src="'+pb+'">'+name+'</div>' + user;
                    count++
                }
            });
            var inter = setInterval(function(){
                if(count == Object.keys(chats).length){
                    clearInterval(inter);
                    dataReady();
                }
            }, 100);
            $('#modal' + mn + '-header').text("Direct Messages");
            function dataReady(){
                $('#modal' + mn + '-content').html('<div class="row dms"><div class="col s4">'+user+'</div><div class="col s8 dm-container" style="display:none"><div class="grey darken-4" id="dm-msg"></div><div class="input-field col s10"><input id="dm_message" type="text" data-length="10"><label for="dm_message">Write a message...</label></div><i class="material-icons small col s2" id="dm_send" style="margin-top:2rem;cursor:pointer">send</i></div></div>');
                $('.dm-user').on('click', function(){
                    $('.dm-user.active').removeClass('active');
                    $(this).addClass('active');
                    loadChat($(this).attr('data-handle'));
                    if($(this).children('span.new.badge').length !== 0){
                        $(this).children('span.new.badge').remove();
                    }
                });
                $('#dm_send').on('click', sendMessage);
                $('#dm_message').on('keyup', function(e){
                    e.preventDefault();
                    if(e.keyCode == 13){
                        sendMessage(e);
                    }
                })
            }
            function loadChat(handle){
                var html = '';
                chats[handle].forEach(function(data, index){
                    var object = renderer.helper.linkAll({text: data.message, entities: data.entities, extended_entities: data.entities, user: data.user});
                    html += '<div class="message"><div class="grey darken-2 '+data.align+'">'+object.tweet + object.medialink+'</div></div>'
                });
                $('.dm-container').fadeOut(150, function(){
                    $('#dm-msg').html(html);
                    $(this).fadeIn(150, function(){
                        $('#dm-msg').scrollTop($('#dm-msg')[0].scrollHeight);
                    });
                    $('#dm-msg .materialboxed').materialbox();
                });
            }
            var active = false;
            function sendMessage(e) {
                e.preventDefault();
                if (!active) {
                    active = true;
                    var message = $('#dm_message').val(),
                        user = $('.dm-user.active').attr('data-handle');
                    $('#dm_send').text('hourglass_empty');
                    $('#dm_message').attr('disabled', '');
                    cDeck.sendDM({text: message, screen_name: user}, function (response) {
                        if (response.result == true) {
                            Materialize.toast('Sent!', 3000);
                            active = false;
                            $('#dm_message').removeAttr('disabled').val('');
                            $('#dm_send').text('send');
                        }
                    });
                }
            }
        }
    });

    $('#button_app').on('click', function(e) {
        e.preventDefault();
        var mn = spawnModal();
        $('#modal' + mn + '-header').text("cDeck To-Go");
        $('#modal' + mn + '-content').html(preloader(true));
        $('#modal' + mn).css('overflow', 'hidden').openModal({
            dismissible: true,
            opacity: .5,
            complete: function () {
                $('#modal' + mn).remove()
            }
        });
        $.get('/api/togo', function (data) {
            if(data.response === true){
                $('#modal' + mn + '-content').html('<p>Scan this QR-Code with a cDeck-compatible app</p><p id="togo_qr"></p><p>Or type in this code:  <pre>'+data.token+'</pre></p>');
                new QRCode(document.getElementById("togo_qr"), "cDeck_To_Go:"+data.token);
            } else {
                $('#modal' + mn).closeModal();
                Materialize.toast('Something went wrong!', 2000);
                log.error('API: Getting To-Go Token failed.');
            }
        })
    });

    $('.dropdown-button').dropdown({constrain_width: false, belowOrigin: true});
    $('#search_activate').on('click', function (e) {
        log.debug('UI: search bar clicked');
        if (e !== undefined) {
            e.preventDefault();
        }
        var search = $(this);
        $(this).hide();
        $(search.parent()).children('form').fadeIn();
        $(search.parent()).find('input').focus();
    });
    $($('#search_activate').parent()).find('input')
        .on('blur', function () {
            log.debug('UI: outside search bar clicked');
            $(this).val('');
            ($($('#search_activate').parent()).children('form').fadeOut(350, function () {
                $('#search_activate').show()
            }));
        })
        .on('keyup', function () {
            if ($(this).val() == 'Y2RlY2s' && $('.modal').length == 0)
                Y2RlY2s();
        });
    $('.collapsible').collapsible();
}