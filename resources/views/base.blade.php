@unless($deliver == 'raw')
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8"/>
    <title>{{$title}} - Konrollraum</title>
    <meta name="description" content="HIER TEXT">
    <meta name="language" content="de">
    <link href="http://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link type="text/css" rel="stylesheet" href="assets/css/materialize.min.css" media="screen,projection"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <!-- Twitter Stuff (Wenn fertig hier Card testen: https://cards-dev.twitter.com/validator) -->
    <meta name="twitter:card" content="summary"/>
    <meta name="twitter:site" content="@HIER TWITTER NAME"/>
    <meta name="twitter:title" content="HIER CARD TITEL"/>
    <meta name="twitter:description" content="HIER CARD BESCHREIBUNG"/>
    <meta name="twitter:image" content="HIER CONTENT BILD FÜR CARD"/>
    <meta property="og:title" content="Kontrollraum">
    <meta property="og:description" content="Beschreibung">
</head>
<body class="blue-grey lighten-5">
<nav class="blue lighten-3">
    <div class="nav-wrapper">
        <a href="#!" class="brand-logo"><img src="assets/sfx/logo.png" alt="Kontrollraum Logo"></a>
        @unless(isset($login))
        <ul class="right hide-on-med-and-down" style="margin-right: 30px;">
            <li class="center-align"><a href="#"><i class="material-icons">search</i></a></li>
            <li><a href="#"><i class="material-icons">apps</i></a></li>
            <li><a href="#"><i class="material-icons">chat_bubble_outline</i></a></li>
            <li><a href="#"><i class="material-icons">notifications_none</i></a></li>
            <li><a href="#"><i class="material-icons">account_circle</i></a></li>
        </ul>
        @endunless
    </div>

</nav>
@endunless
@yield('content')
@unless($deliver == 'raw')
<script type="text/javascript" src="assets/js/pace.min.js"></script>
<script type="text/javascript" src="assets/js/jquery-2.1.1.min.js"></script>
<script type="text/javascript" src="assets/js/materialize.min.js"></script>
</body>
</html>
@endunless