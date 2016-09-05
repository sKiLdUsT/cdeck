$(document).ready(function(){
    var $user = JSON.parse($('.section').attr('data-user'));
    $('body').css('background-image', 'linear-gradient( rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5) ), url(\''+$user.banner+'\')');
    if (WaveSurfer.Swf.supportsAudioContext() && WaveSurfer.Swf.supportsCanvas()) {
        var waveSurfer = Object.create(WaveSurfer);
        onWaveSurferInitialized(waveSurfer);
    } else {
        swfobject.embedSWF('/assets/swf/wavesurfer.swf', 'waveform', '100%', '128', '11.1.0', 'expressInstall.swf', {id: 'waveform'}, {allowScriptAccess: 'always'}, {});
        var waveSurfer = new WaveSurfer.Swf('myWaveSurferId');
        waveSurfer.on('init', function() {
            onWaveSurferInitialized(waveSurfer);
        });
    }
    function onWaveSurferInitialized(waveSurfer){
        window.wavesurfer = waveSurfer;
        wavesurfer.init({
            container: '#waveform',
            waveColor: 'blue',
            progressColor: 'red',
            backgroundColor: '#333333',
            barWidth: '3',
            normalize: true
        });
        wavesurfer.load($('#waveform').attr('data-media-url'));
        wavesurfer.on('finish', function () {
            $('#play').removeClass('playing')
        });
    }
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
});
$(window).resize(function(){
    wavesurfer.empty();
    wavesurfer.drawBuffer();
});