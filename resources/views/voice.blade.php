@unless(isset($deliver) AND $deliver == 'raw')
<!DOCTYPE html>
<html lang="{{App::getLocale()}}">
    <head>
        @include('include.head')
        <link type="text/css" rel="stylesheet" href="{{elixir('assets/css/app.voice.css')}}" media="screen,projection"/>
    </head>
    <body>
@endunless
        <div class="section" data-user="{{json_encode($user)}}">
            <div class="row">
                <div class="user col s12">
                    <div class="pb">
                        <img class="circle" src="{{str_replace('_normal', '', $user->avatar)}}">
                    </div>
                    <div class="white-text info">
                        <div id="name">
                            <h3>{{$user->name}}</h3>
                        </div>
                        <div id="misc">
                            <div id="handle">
                                <h5><a class="grey-text" href="https://twitter.com/{{$user->handle}}" target="_blank">{{'@'.$user->handle}}</a></h5>
                            </div>
                            <br>
                            <div id="time">
                                <h6 class="white-text">{{$time}} MST</h6>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="waveform" class="col s12" data-media-url="{{$url}}"></div>
                <div class="controls center-align col s12">
                    <a id="play" class="btn waves-effect"><i class="material-icons">play_arrow</i>/<i class="material-icons">pause</i></a>
                    <a id="stop" class="btn waves-effect"><i class="material-icons">stop</i></a>
                </div>
            </div>
        </div>
@unless(isset($deliver) AND $deliver == 'raw')
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
            <script type="text/javascript" src="{{elixir('assets/js/app.voice.js')}}"></script>
    </body>
</html>
@endunless