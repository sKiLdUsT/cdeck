@extends('base')

@section('content')
    <meta name="highlights" content="{{$highlights}}">
    <main class="conatiner home">
        <div class="row">
            <div class="col s12 hide-on-large-only" style="height: auto">
                <ul class="tabs">
                    <li class="tab col s4"><a class="active" href="#tab1"><i class="material-icons" style="font-size: 2rem">home</i></a></li>
                    <li class="tab col s4"><a href="#tab2"><i class="material-icons" style="font-size: 2rem">notifications</i></a></li>
                </ul>
            </div>
            <div id="tab1" class="col s12 m12 l3 z-depth-1">
                <div class="section center-align">
                    <h4 class="hide-on-med-and-down"><i class="material-icons @if(json_decode(Auth::user()->uconfig)->colormode == 1)white-text @endif" style="font-size: 3rem">home</i></h4>
                    <div id="timeline" class="pad">
                        <div class="divider"></div>
                        <div class="preloader-wrapper big active">
                            <div class="spinner-layer spinner-blue">
                                <div class="circle-clipper left">
                                    <div class="circle"></div>
                                </div>
                                <div class="gap-patch">
                                    <div class="circle"></div>
                                </div>
                                <div class="circle-clipper right">
                                    <div class="circle"></div>
                                </div>
                            </div>

                            <div class="spinner-layer spinner-red">
                                <div class="circle-clipper left">
                                    <div class="circle"></div>
                                </div>
                                <div class="gap-patch">
                                    <div class="circle"></div>
                                </div>
                                <div class="circle-clipper right">
                                    <div class="circle"></div>
                                </div>
                            </div>

                            <div class="spinner-layer spinner-yellow">
                                <div class="circle-clipper left">
                                    <div class="circle"></div>
                                </div>
                                <div class="gap-patch">
                                    <div class="circle"></div>
                                </div>
                                <div class="circle-clipper right">
                                    <div class="circle"></div>
                                </div>
                            </div>

                            <div class="spinner-layer spinner-green">
                                <div class="circle-clipper left">
                                    <div class="circle"></div>
                                </div>
                                <div class="gap-patch">
                                    <div class="circle"></div>
                                </div>
                                <div class="circle-clipper right">
                                    <div class="circle"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="tab2" class="col s12 m12 l3 z-depth-1">
                <div class="section center-align">
                    <h4 class="hide-on-med-and-down"><i class="material-icons @if(json_decode(Auth::user()->uconfig)->colormode == 1)white-text @endif" style="font-size: 3rem">notifications</i></h4>
                    <div id="notifications" class="pad">
                        <div class="divider"></div>
                        <div class="preloader-wrapper big active">
                            <div class="spinner-layer spinner-blue">
                                <div class="circle-clipper left">
                                    <div class="circle"></div>
                                </div>
                                <div class="gap-patch">
                                    <div class="circle"></div>
                                </div>
                                <div class="circle-clipper right">
                                    <div class="circle"></div>
                                </div>
                            </div>

                            <div class="spinner-layer spinner-red">
                                <div class="circle-clipper left">
                                    <div class="circle"></div>
                                </div>
                                <div class="gap-patch">
                                    <div class="circle"></div>
                                </div>
                                <div class="circle-clipper right">
                                    <div class="circle"></div>
                                </div>
                            </div>

                            <div class="spinner-layer spinner-yellow">
                                <div class="circle-clipper left">
                                    <div class="circle"></div>
                                </div>
                                <div class="gap-patch">
                                    <div class="circle"></div>
                                </div>
                                <div class="circle-clipper right">
                                    <div class="circle"></div>
                                </div>
                            </div>

                            <div class="spinner-layer spinner-green">
                                <div class="circle-clipper left">
                                    <div class="circle"></div>
                                </div>
                                <div class="gap-patch">
                                    <div class="circle"></div>
                                </div>
                                <div class="circle-clipper right">
                                    <div class="circle"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </div>
        <div class="fixed-action-btn horizontal" style="bottom: 45px; right: 24px;">
            <a class="btn-floating btn-large red darken-4" id="newTweet">
                <i class="large material-icons">mode_edit</i>
            </a>
        </div>
        <audio preload style="display:none" id="notification"><source src="/assets/bing.mp3" type="audio/mpeg"></audio>
        <form id="donate_form" style="display: none" action="https://www.paypal.com/cgi-bin/webscr" method="post" target="blank"><input type="hidden" name="cmd" value="_s-xclick"><input type="hidden" name="hosted_button_id" value="PBAECV4VJWCPC"></form>
    </main>
    @include('include.highlights')
@endsection