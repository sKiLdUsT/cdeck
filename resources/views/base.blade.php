<?php Auth::user() && json_decode(Auth::user()->uconfig)->colormode == 1 ? $colormode = 1 : $colormode = 0 ?>
@unless(isset($deliver) AND $deliver == 'raw')
        <!DOCTYPE html>
<html lang="{{App::getLocale()}}">
<head>
    @include('include.head')
</head>
<body class="grey {{ $colormode == 0 ? 'lighten-2 black-text' : 'darken-3 white-text'}}">
<body class="grey {{ $colormode == 0 ? 'lighten-2 black-text' : 'darken-3 white-text'}}">
<div style="z-index: 9999; width: 100%; height: 100%; position: fixed; background-color: #000;" class="loader valign-wrapper">
    <video autoplay loop src="/assets/img/pulse.webm"></video>
</div>
<noscript>
    <div style="z-index: 9999; width: 100%; height: 100%; position: fixed; background-color: #000;" class="loader valign-wrapper">
        <div class="container">
            <h1>Hi there!</h1><br>
            <h3>Unfortunately you need JavaScript activated and functioning to use this service. That's a bummer :-(</h3>
        </div>
    </div>
</noscript>
<div class="navbar-fixed">
    <nav role="navigation" class="red darken-4">
        <div class="nav-wrapper">
            <a href="/" class="brand-logo"><img src="/assets/img/logo.png" alt="cDeck Logo" class="z-depth-2" style="width: 75px;height: 75px; margin: 5px 0 0 10px; border-radius: 50%"></a>
            <ul class="right hide-on-med-and-down" style="margin-right: 30px;">
                <li><a href="/blog" class="tooltipped" data-tooltip="@lang('menu.blog')"><i class="material-icons">developer_board</i></a></li>
                <li><a class="dropdown-button" href="#" style="display:none" data-activates="clients">@lang('message.getclient')</a></li>
                <ul id="clients" class="dropdown-content {{ $colormode == 0 ? 'lighten-2' : 'darken-3 white-text'}}" style="margin-top:64px;">
                    <li><a href="{{isset($clients->win_64) ?$clients->win_64: "#"}}">Windows</a></li>
                    <li><a href="{{isset($clients->mac_dmg) ?$clients->mac_dmg: "#"}}">Mac OS</a></li>
                    <li><a><strike>Linux (.deb)</strike> (comming soon!)</a></li>
                    <li class="divider"></li>
                    <li><a href="{{isset($clients->android) ?$clients->android: "#"}}">Android</a></li>
                </ul>
                @unless(isset($hideNavbar))
                    <li class="center-align">
                        <a id="search_activate" class="tooltipped" data-tooltip="@lang('menu.search')"><i class="material-icons">search</i></a>
                        <form style="display:none;">
                            <div class="input-field">
                                <input id="search" type="search" required>
                                <label for="search"><i class="material-icons">search</i></label>
                            </div>
                        </form>
                    </li>
                    <li><a class="dropdown-button tooltipped" href="#" data-tooltip="@lang('menu.apps')" data-activates="apps"><i class="material-icons">apps</i></a>
                    </li>
                    <ul id="apps" class="dropdown-content centered grey {{ $colormode == 0 ? 'lighten-2 black-text' : 'darken-3 white-text'}}">
                        <div class="row" style="margin-top: 20px">
                            <div class="col s4">
                                <li>
                                    <a class="truncate tooltipped orange-text"data-tooltip="@lang('menu.voice')" id="button_voice"><i class="large material-icons" style="font-size:4rem;">keyboard_voice</i><span class="new badge red" data-badge-caption="Alpha"></span></a>
                                </li>
                            </div>
                            <div class="col s4">
                                <li>
                                    <a class="truncate tooltipped orange-text"data-tooltip="@lang('menu.color')" id="button_nightmode"><i class="large material-icons" style="font-size:4rem;">iso</i></a>
                                </li>
                            </div>
                            <div class="col s4">
                                <li>
                                    <a class="truncate tooltipped orange-text"data-tooltip="@lang('menu.map')" id="button_map"><i class="large material-icons" style="font-size:4rem;">person_pin_circle</i></a>
                                </li>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col s4">
                                <li>
                                    <a class="truncate tooltipped orange-text"data-tooltip="@lang('menu.notifications')" id="button_notifications"><i class="large material-icons" style="font-size:4rem;">notifications</i></a>
                                </li>
                            </div>
                            <div class="col s4">
                                <li>
                                    <a class="truncate tooltipped orange-text"data-tooltip="@lang('menu.settings')" id="button_settings"><i class="large material-icons" style="font-size:4rem;">settings</i></a>
                                </li>
                            </div>
                            <div class="col s4">
                                <li>
                                    <a class="truncate tooltipped orange-text"data-tooltip="@lang('menu.lang')" id="button_language"><i class="large material-icons" style="font-size:4rem;">language</i></a>
                                </li>
                            </div>
                        </div>
                    </ul>
                    <li><a href="#" class="tooltipped" data-tooltip="@lang('menu.messages')"><i class="material-icons">chat_bubble_outline</i></a></li>
                    <li><a class="dropdown-button" href="#" data-activates="accounts">
                            @if(Auth::user() && isset($accounts) && $accounts[0]->media->avatar)
                                <img src="{{str_replace("_normal", "", $accounts[isset($aid) ? $aid : 0]->media->avatar)}}" alt="@lang('message.pb')"
                                     class="circle responsive-img valign pb" id="pb">
                            @else
                                <i class="material-icons">account_circle</i>
                            @endif
                        </a>
                        <ul id="accounts" class="dropdown-content grey {{ $colormode == 0 ? 'lighten-2 black-text' : 'darken-3 white-text'}}" style="margin-top:64px;">
                            <?php $count = 0; ?>
                            @if(isset($accounts))
                                    @foreach($accounts as $account)
                                        <li><a data-id="{{$count++}}" class="changeTl"><img src="{{str_replace("_normal", "", $account->media->avatar)}}"
                                                                                            alt="@lang('message.pb')"
                                                                                            class="circle responsive-img pb">{{base64_decode($account->name)}}
                                            </a></li>
                                    @endforeach
                            @endif
                            <li class="divider"></li>
                            <li><a href="/auth/twitter?add=true"><i class="material-icons">person_add</i>@lang('message.addacc')</a></li>
                            <li><a id="button_remacc"><i class="material-icons">person</i>@lang('message.remacc')</a></li>
                            <li><a href="/logout"><i class="material-icons">person_outline</i>Logout</a></li>
                        </ul>
                    </li>
                @endunless
                @unless(!isset($blogmode))
                    <li class="center-align">
                    <li><a href="@if(!Auth::user()) /login @else /blog/settings @endif">
                            @if(Auth::user() && isset($accounts) && $accounts[0]->media->avatar)
                                <img src="{{$accounts[0]->media->avatar}}" alt="@lang('message.pb')"
                                     class="circle responsive-img valign" id="pb">
                            @else
                                <i class="material-icons">account_circle</i>
                            @endif
                        </a></li>
                    </li>
                @endunless
            </ul>
            @unless(isset($hideNavbar))
                <a href="#" data-activates="slide-out" class="button-collapse hide-on-large-only"
                   style="margin-left: 18px;"><i class="material-icons">menu</i></a>
                <ul id="slide-out" class="side-nav grey {{ $colormode == 0 ? 'lighten-2 black-text' : 'darken-3 white-text'}}">
                    <li><div class="userView">
                            @if(Auth::user() && isset($accounts) && $accounts[0]->media->avatar)
                                <img class="background" src="{{$accounts[0]->media->banner}}" style="max-height: 200px;margin-left: -50%;">
                                <img class="circle" src=" {{str_replace("_normal", "", $accounts[0]->media->avatar)}}">
                                <span class="name white-text">{{$accounts[0]->name}}</span>
                            @else
                                <i class="material-icons">account_circle</i>
                            @endif
                            <br>
                        </div>
                    </li>
                    <li><a href="#!"><i class="material-icons">chat_bubble_outline</i>@lang('menu.messages')</a></li>
                    <li><div class="divider"></div></li>
                    <li><a class="subheader">@lang('menu.apps')</a></li>
                    <li><a id="button_nightmode" href="#!"><i class="material-icons">iso</i>@lang('menu.color')</a></li>
                    <li><a id="button_map" href="#!"><i class="material-icons">person_pin_circle</i>@lang('menu.map')</a></li>
                    <li><a id="button_settings" href="#!"><i class="material-icons">settings</i>@lang('menu.settings')</a></li>
                    <li><a id="button_language" href="#!"><i class="material-icons">language</i>@lang('menu.lang')</a></li>
                </ul>
            @endunless
        </div>

    </nav>
</div>
@endunless
<div class="section">
    @yield('content')
</div>
@unless(isset($deliver) AND $deliver == 'raw')
    <link type="text/css" rel="stylesheet" href="{{elixir('assets/css/app.css')}}" media="screen,projection"/>
    <script src="{{elixir('assets/js/app.js')}}"></script>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <!--<script>var request=new XMLHttpRequest();request.open('GET','{{elixir('assets/js/app.js')}}',true);request.onload=function(){if(request.status>=200&&request.status<400){window.$siteCode=request.responseText;window.eval($siteCode);}else{location.reload()}};request.onerror=function(){location.reload()};request.send();</script>-->
        </body>
    </html>
@endunless