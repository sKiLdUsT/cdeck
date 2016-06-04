<!DOCTYPE html>
<html>
<head>
    <title>cDeck</title>
    <meta name="twitter:card" content="photo" />
    <meta name="twitter:site" content="@cDeckapp" />
    <meta name="twitter:title" content="Moderner und intelligenter Twitter-Client " />
    <meta name="twitter:image" content="https://cdeck.net/assets/img/icon/apple-icon-180x180.png" />
    <meta name="twitter:url" content="https://cdeck.net/assets/img/icon/apple-icon-180x180.png" />
    <link rel="apple-touch-icon" sizes="57x57" href="/assets/img/icon/apple-icon-57x57.png">
    <link rel="apple-touch-icon" sizes="60x60" href="/assets/img/icon/apple-icon-60x60.png">
    <link rel="apple-touch-icon" sizes="72x72" href="/assets/img/icon/apple-icon-72x72.png">
    <link rel="apple-touch-icon" sizes="76x76" href="/assets/img/icon/apple-icon-76x76.png">
    <link rel="apple-touch-icon" sizes="114x114" href="/assets/img/icon/apple-icon-114x114.png">
    <link rel="apple-touch-icon" sizes="120x120" href="/assets/img/icon/apple-icon-120x120.png">
    <link rel="apple-touch-icon" sizes="144x144" href="/assets/img/icon/apple-icon-144x144.png">
    <link rel="apple-touch-icon" sizes="152x152" href="/assets/img/icon/apple-icon-152x152.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/assets/img/icon/apple-icon-180x180.png">
    <link rel="icon" type="image/png" sizes="192x192"  href="/assets/img/icon/android-icon-192x192.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/img/icon/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="96x96" href="/assets/img/icon/favicon-96x96.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/assets/img/icon/favicon-16x16.png">
    <link rel="manifest" href="/manifest.json">
    <meta name="msapplication-TileColor" content="#ffffff">
    <meta name="msapplication-TileImage" content="/ms-icon-144x144.png">
    <meta name="theme-color" content="#ffffff">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.6/css/materialize.min.css">
    <link href="https://fonts.googleapis.com/css?family=Roboto:100" rel="stylesheet" type="text/css">
    <style>html, body{height: 100%;}body{margin: 0; padding: 0; width: 100%; color: #FFFFFF; display: table; background-color: #ffd180; font-weight: 100; font-family: 'Roboto';}.container{text-align: center; display: table-cell; vertical-align: middle;}.content{text-align: center; display: inline-block;}.title{font-size: 72px; margin-bottom: 40px;}</style>
    <script type="text/javascript" src="//code.jquery.com/jquery-2.2.4.min.js"></script>
</head>
<body>
<div class="container">
    <div class="content">
        <div class="title">Hier gibt es nix zu sehen...</div>
        <b>Wir räumen nur etwas auf, gleich geht es weiter :-)</b>
        <div class="progress">
            <div class="indeterminate"></div>
        </div>

        <a href="https://twitter.com/cDeckapp" class="twitter-follow-button" data-show-count="false" data-size="large">Follow @cDeckapp</a>
        <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
        <script>setInterval(function(){$(document).ready(function(){$.ajax({type:'GET',url:document.location,success:function(){location.reload()}})})}, 2000)</script>
    </div>
</div>
</body>
</html>