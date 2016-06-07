@unless(isset($deliver) AND $deliver == 'raw')
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8"/>
    <title>{{$title or ""}}cDeck</title>
    <meta name="description" content="HIER TEXT">
    <meta name="language" content="de">
    <link href="http://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link type="text/css" rel="stylesheet" href="{{elixir('assets/css/app.css')}}" media="screen,projection"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <meta name="twitter:card" content="summary"/>
    <meta name="twitter:site" content="@cdeckapp"/>
    <meta name="twitter:title" content="cDeck"/>
    <meta name="twitter:description" content="Moderner und intelligenter Twitter-Client"/>
    <meta name="twitter:image" content="/assets/img/logo.png"/>
    <meta property="og:title" content="cDeck">
    <meta property="og:description" content="Moderner und intelligenter Twitter-Client">
</head>
<body class="blue-grey lighten-5">
<nav class="blue lighten-3">
    <div class="nav-wrapper">
        <a href="#!" class="brand-logo"><img src="assets/img/logo.png" alt="Kontrollraum Logo"></a>
        @unless(isset($hideNavbar) or !isset($file))
        <ul class="right hide-on-med-and-down" style="margin-right: 30px;">
            <li class="center-align"><a href="#"><i class="material-icons">search</i></a></li>
            <li><a href="#"><i class="material-icons">apps</i></a></li>
            <li><a href="#"><i class="material-icons">chat_bubble_outline</i></a></li>
            <li><a href="#"><i class="material-icons">notifications_none</i></a></li>
            <li><a href="#">
                        @if(Storage::disk('content')->has($file))
                        <img src="/usrcontent/{{$file}}" alt="Profilbild" class="circle responsive-img">
                        @else
                        <i class="material-icons">account_circle</i>
                        @endif
                </a></li>
        </ul>
        @endunless
    </div>

</nav>
@endunless
@yield('content')
@unless(isset($deliver) AND $deliver == 'raw')
    <script type="text/javascript" src="{{elixir('assets/js/app.js')}}"></script>
</body>
</html>
@endunless