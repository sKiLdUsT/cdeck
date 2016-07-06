@unless(isset($deliver) AND $deliver == 'raw')
        <!DOCTYPE html>
<html>
<head>
    @include('include.head')
    <link type="text/css" rel="stylesheet" href="{{elixir('assets/css/app.css')}}" media="screen,projection"/>
</head>
<body class="blue-grey lighten-5">
<div class="navbar-fixed">
    <nav role="navigation" class="red darken-4">
        <div class="nav-wrapper">
            <a href="#!" class="brand-logo"><img src="assets/img/logo.png" alt="cDeck Logo" style="width: 75px;height: 75px; margin: 5px 0 0 10px"></a>
            @unless(isset($hideNavbar))
                <ul class="right hide-on-med-and-down valign-wrapper" style="margin-right: 30px;">
                    <li class="center-align"><a href="#"><i class="material-icons">search</i></a></li>
                    <li><a class="dropdown-button" href="#" data-activates="dropdown1"><i class="material-icons">apps</i></a></li>
                    <ul id="dropdown1" class="dropdown-content" style="margin-top: 64px">
                        <li><a href="#!">one</a></li>
                        <li><a href="#!">two</a></li>
                        <li class="divider"></li>
                        <li><a href="#!">three</a></li>
                    </ul>
                    <li><a href="#"><i class="material-icons">chat_bubble_outline</i></a></li>
                    <li><a href="#">
                            @if(Auth::user()->avatar)
                                <img src="{{Auth::user()->avatar}}" alt="Profilbild"
                                     class="circle responsive-img valign">
                            @else
                                <i class="material-icons">account_circle</i>
                            @endif
                        </a></li>
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