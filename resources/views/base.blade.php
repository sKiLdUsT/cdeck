<?php if(!isset($clients)): $clients = json_decode(file_get_contents('https://toolbox.kontrollraum.org/cdeck/')); endif; ?>

@unless(isset($deliver) AND $deliver == 'raw')
        <!DOCTYPE html>
<html lang="{{App::getLocale()}}">
<head>
    @include('include.head')
    <link type="text/css" rel="stylesheet" href="{{elixir('assets/css/app.css')}}" media="screen,projection"/>
</head>
<body class="grey @if(Auth::user() && json_decode(Auth::user()->uconfig)->colormode == 0)lighten-2 @else darken-3 @endif">
<div class="navbar-fixed">
    <nav role="navigation" class="red darken-4">
        <div class="nav-wrapper">
            <a href="/" class="brand-logo"><img src="/assets/img/logo.png" alt="cDeck Logo"
                                                 style="width: 75px;height: 75px; margin: 5px 0 0 10px"></a>
            <ul class="right hide-on-med-and-down" style="margin-right: 30px;">
                <li><a href="/blog" class="tooltipped" data-tooltip="@lang('menu.blog')"><i class="material-icons">developer_board</i></a></li>
                <li><a class="dropdown-button" href="#" data-activates="clients">@lang('message.getclient')</a></li>
                <ul id="clients" class="dropdown-content" style="margin-top:64px;">
                    <li><a href="{{$clients->win_64}}">Windows</a></li>
                    <li><a href="{{$clients->mac_dmg}}">Mac OS</a></li>
                    <li><a><strike>Linux (.deb)</strike> (comming soon!)</a></li>
                    <li class="divider"></li>
                    <li><a href="{{$clients->android}}">Android</a></li>
                </ul>
                @unless(isset($hideNavbar))
                    <li class="center-align">
                        <a id="search_activate" class="tooltipped" data-tooltip="@lang('menu.search')"><i class="material-icons">search</i></a>
                        <form style="display:none;">
                            <div class="input-field">
                                <input id="search" type="search" required>
                                <label for="search"><i class="material-icons">search</i></label>
                                <i class="material-icons">close</i>
                            </div>
                        </form>
                    </li>
                    <li><a class="dropdown-button tooltipped" href="#" data-tooltip="@lang('menu.apps')" data-activates="apps"><i class="material-icons">apps</i></a>
                    </li>
                    <ul id="apps" class="dropdown-content black-text centered">
                        <div class="row" style="margin-top: 20px">
                            <div class="col s4">
                                <li>
                                    <a class="truncate tooltipped orange-text"data-tooltip="@lang('menu.voice')" id="button_voice"><i class="large material-icons" style="font-size:4rem;">keyboard_voice</i><span class="new badge red" data-badge-caption="Alpha"></span>
                                        <br>@lang('menu.voice')</a>
                                </li>
                            </div>
                            <div class="col s4">
                                <li>
                                    <a class="truncate tooltipped orange-text"data-tooltip="@lang('menu.color')" id="button_nightmode"><i class="large material-icons" style="font-size:4rem;">iso</i>
                                        <br>@lang('menu.color')</a>
                                </li>
                            </div>
                            <div class="col s4">
                                <li>
                                    <a class="truncate tooltipped orange-text"data-tooltip="@lang('menu.map')" id="button_map"><i class="large material-icons" style="font-size:4rem;">person_pin_circle</i>
                                        <br>@lang('menu.map')</a>
                                </li>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col s4">
                                <li>
                                    <a class="truncate tooltipped orange-text"data-tooltip="@lang('menu.notifications')" id="button_notifications"><i class="large material-icons" style="font-size:4rem;">notifications</i>
                                        <br>@lang('menu.notifications')</a>
                                </li>
                            </div>
                            <div class="col s4">
                                <li>
                                    <a class="truncate tooltipped orange-text"data-tooltip="@lang('menu.settings')" id="button_settings"><i class="large material-icons" style="font-size:4rem;">settings</i>
                                        <br>@lang('menu.settings')</a>
                                </li>
                            </div>
                            <div class="col s4">
                                <li>
                                    <a class="truncate tooltipped orange-text"data-tooltip="@lang('menu.lang')" id="button_language"><i class="large material-icons" style="font-size:4rem;">language</i>
                                        <br>@lang('menu.lang')</a>
                                </li>
                            </div>
                        </div>
                    </ul>
                    <li><a href="#" class="tooltipped" data-tooltip="@lang('menu.messages')"><i class="material-icons">chat_bubble_outline</i></a></li>
                    <li><a class="dropdown-button" href="#" data-activates="accounts">
                            @if(Auth::user() && isset($accounts) && $accounts[0]->avatar)
                                <img src="{{$accounts[0]->avatar}}" alt="@lang('message.pb')"
                                     class="circle responsive-img valign" id="pb">
                            @else
                                <i class="material-icons">account_circle</i>
                            @endif
                        </a>
                        <ul id="accounts" class="dropdown-content" style="margin-top:64px;">
                            <?php $count = 0; ?>
                            @if(isset($accounts))
                                @foreach($accounts as $account)
                                    <li><a href="#!" data-id="{{$count++}}" class="changeTl"><img src="{{$account->avatar}}"
                                                                                                  alt="@lang('message.pb')"
                                                                                                  class="circle responsive-img">{{$account->name}}
                                        </a></li>
                                    @endforeach
                            @endif
                            <li class="divider"></li>
                            <li><a href="/auth/twitter?add=true"><i class="material-icons">person_add</i>@lang('message.addacc')</a>
                            </li>
                        </ul>
                    </li>
                @endunless
                @unless(!isset($blogmode))
                    <li class="center-align">
                    <li><a href="@if(!Auth::user()) /login @else /blog/settings @endif">
                            @if(Auth::user() && isset($accounts) && $accounts[0]->avatar)
                                <img src="{{$accounts[0]->avatar}}" alt="@lang('message.pb')"
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
                <ul id="slide-out" class="side-nav">
                    <li><div class="userView">
                            @if(Auth::user() && isset($accounts) && $accounts[0]->avatar)
                                <img class="background" src="{{$accounts[0]->banner}}" style="max-height: 200px;margin-left: -50%;">
                                <img class="circle" src=" {{$accounts[0]->avatar}}">
                                <span class="name">{{$accounts[0]->name}}</span>
                            @else
                                <i class="material-icons">account_circle</i>
                            @endif
                            <br>
                        </div></li>
                    <li class="no-padding">
                        <ul class="collapsible collapsible-accordion">
                            <a class="collapsible-header">Applets<i class="material-icons">arrow_drop_down</i></a>
                            <div class="collapsible-body">
                                <ul>
                                <li>
                                    <a class="truncate tooltipped orange-text" data-tooltip="@lang('menu.voice')" id="button_voice"><i class="large material-icons" style="font-size:4rem;">keyboard_voice</i>
                                        <br>@lang('menu.voice')</a>
                                </li>
                                <li>
                                    <a class="truncate tooltipped orange-text" data-tooltip="@lang('menu.color')" id="button_nightmode"><i class="large material-icons" style="font-size:4rem;">iso</i>
                                        <br>@lang('menu.color')</a>
                                </li>
                                <li>
                                    <a class="truncate tooltipped orange-text" data-tooltip="@lang('menu.map')" id="button_map"><i class="large material-icons" style="font-size:4rem;">person_pin_circle</i>
                                        <br>@lang('menu.map')</a>
                                </li>
                                <li>
                                    <a class="truncate tooltipped orange-text" data-tooltip="@lang('menu.notifications')" id="button_notifications"><i class="large material-icons" style="font-size:4rem;">notifications</i>
                                        <br>@lang('menu.notifications')</a>
                                </li>
                                <li>
                                    <a class="truncate tooltipped orange-text" data-tooltip="@lang('menu.settings')" id="button_settings"><i class="large material-icons" style="font-size:4rem;">settings</i>
                                        <br>@lang('menu.settings')</a>
                                </li>
                               <li>
                                    <a class="truncate tooltipped orange-text" data-tooltip="@lang('menu.lang')" id="button_language"><i class="large material-icons" style="font-size:4rem;">language</i>
                                        <br>@lang('menu.lang')</a>
                                </li>
                                </ul>
                            </div>
                        </ul>
                    </li>
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
    <!--<script>var request=new XMLHttpRequest();request.open('GET','{{elixir('assets/js/app.js')}}',true);request.onload=function(){if(request.status>=200&&request.status<400){window.$siteCode=request.responseText;window.eval($siteCode);}else{location.reload()}};request.onerror=function(){location.reload()};request.send();</script>
    -->
    <script type="text/javascript" src="{{elixir('assets/js/app.js')}}"></script>
        </body>
    </html>
@endunless