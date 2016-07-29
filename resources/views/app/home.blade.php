@extends('base')

@section('content')
    <main class= conatiner">
        <div class="row">
            <div class="col s12 hide-on-large-only" style="height: auto">
                <ul class="tabs">
                    <li class="tab col s4"><a href="#tab1">Test 1</a></li>
                    <li class="tab col s4"><a class="active" href="#tab2"><i class="material-icons" style="font-size: 2rem">home</i></a></li>
                    <li class="tab col s4"><a href="#tab3"><i class="material-icons" style="font-size: 2rem">notifications</i></a></li>
                </ul>
            </div>
            <div id="tab1" class="col s12 m12 l3">
                <div class="section center-align">
                    <h4 class="hide-on-med-and-down"><i class="material-icons" style="font-size: 3rem">trending_up</i></h4>
                    <div class="slimScroll">
                        <div class="divider"></div>










                    </div>
                </div>
            </div>
            <div id="tab2" class="col s12 m12 l6">
                <div class="section center-align">
                    <h4 class="hide-on-med-and-down"><i class="material-icons" style="font-size: 3rem">home</i></h4>
                    <div id="timeline" class="slimScroll">
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
            <div id="tab3" class="col s12 m12 l3">
                <div class="section center-align">
                    <h4 class="hide-on-med-and-down"><i class="material-icons" style="font-size: 3rem">notifications</i></h4>
                    <div id="notifications" class="slimScroll">
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
            <a class="btn-floating btn-large red">
                <i class="large material-icons">mode_edit</i>
            </a>
            <ul>
                <li><a class="btn-floating yellow darken-1" id="newTweet"><i class="material-icons">format_quote</i></a>
                </li>
                <li><a class="btn-floating blue" id="newMedia"><i class="material-icons">perm_media</i></a></li>
            </ul>
        </div>
    </main>
@endsection