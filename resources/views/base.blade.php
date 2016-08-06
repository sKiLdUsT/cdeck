@unless(isset($deliver) AND $deliver == 'raw')
        <!DOCTYPE html>
<html>
<head>
    @include('include.head')
    <link type="text/css" rel="stylesheet" href="{{elixir('assets/css/app.css')}}" media="screen,projection"/>
</head>
<body class="grey lighten-2">
<div class="navbar-fixed">
    <nav role="navigation" class="red darken-4">
        <div class="nav-wrapper">
            <a href="#!" class="brand-logo"><img src="assets/img/logo.png" alt="cDeck Logo" style="width: 75px;height: 75px; margin: 5px 0 0 10px"></a>
            <ul class="right" style="margin-right: 30px;">
                <li><a class="dropdown-button" href="#" data-activates="dropdown2">Get the client!</a></li>
                <ul id="dropdown2" class="dropdown-content" style="margin-top: 64px">
                    <li><a href="{{$clients->win_64}}">Windows</a></li>
                    <li><a href="{{$clients->mac_dmg}}">Mac OS</a></li>
                    <li><a><strike>Linux (.deb)</strike> (comming soon!)</a></li>
                    <li class="divider"></li>
                    <li><a href="{{$clients->android}}">Android</a></li>
                </ul>
            @unless(isset($hideNavbar))
                    <li class="center-align"><a href="#"><i class="material-icons">search</i></a></li>
                    <li><a class="dropdown-button" href="#" data-activates="dropdown1"><i class="material-icons">apps</i></a></li>
                    <ul id="dropdown1" class="dropdown-content" style="margin-top: 64px">
                        <li><a href="#!">one</a></li>
                        <li><a href="#!">two</a></li>
                        <li class="divider"></li>
                        <li><a href="#!">three</a></li>
                    </ul>
                    <li><a href="#"><i class="material-icons">chat_bubble_outline</i></a></li>
                    <li><a class="dropdown-button" href="#" data-activates="accounts">
                            @if(json_decode(Auth::user()->accounts)[0]->avatar)
                                <img src="{{json_decode(Auth::user()->accounts)[0]->avatar}}" alt="Profilbild" class="circle responsive-img valign" id="pb">
                            @else
                                <i class="material-icons">account_circle</i>
                            @endif
                        </a>
                        <ul id="accounts" class="dropdown-content" style="margin-top: 64px">
                            <?php $count = 0; ?>
                            @foreach($accounts as $account)
                            <li><a href="#!" data-id="{{$count++}}" class="changeTl"><img src="{{$account->avatar}}" alt="Profilbild" class="circle responsive-img">{{$account->name}}</a></li>
                            @endforeach
                            <li class="divider"></li>
                            <li><a href="/auth/twitter?add=true"><i class="material-icons">person_add</i>Add account</a></li>
                        </ul></li>
                @endunless
            </ul>
            @unless(isset($hideNavbar))
                <a href="#" data-activates="slide-out" class="button-collapse hide-on-large-only" style="margin-left: 18px; display: none;"><i class="material-icons">menu</i></a>
                <ul id="slide-out" class="side-nav">
                    <li><div class="userView">
                            @if(Auth::user()->banner)
                                <img class="background" src="{{json_decode(Auth::user()->accounts)[0]->banner}}" style="max-height: 200px;margin-left: -50%;">
                            @else
                                <img class="background red darken-3" src="">
                            @endif
                            @if(Auth::user()->avatar)
                                <a href=""><img class="circle" src=" {{json_decode(Auth::user()->accounts)[0]->avatar}}"></a>
                            @else
                                <i class="material-icons">account_circle</i>
                            @endif
                            <a href=""><span class="white-text name"></span></a>
                        </div></li>
                    <li><a href="#"><i class="material-icons">search</i> Search</a></li>
                    <li><a class="dropdown-button" href="#" data-activates="dropdown1"><i class="material-icons">apps</i> Tools</a></li>
                    <ul id="dropdown1" class="dropdown-content" style="margin-top: 64px">
                        <li><a href="#!">one</a></li>
                        <li><a href="#!">two</a></li>
                        <li class="divider"></li>
                        <li><a href="#!">three</a></li>
                    </ul>
                    <li><a href="#"><i class="material-icons">chat_bubble_outline</i> Messages</a></li>
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
    <script type="text/javascript" src="{{elixir('assets/js/app.js')}}"></script>
</body>
</html>
@endunless