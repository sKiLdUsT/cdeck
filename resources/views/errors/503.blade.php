<!DOCTYPE html>
<html>
<head>
    @include('include.head')
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.6/css/materialize.min.css">
    <link href="https://fonts.googleapis.com/css?family=Roboto:100" rel="stylesheet" type="text/css">
    <style>html, body{height: 100%;}body{margin: 0; padding: 0; width: 100%; color: #FFFFFF; display: table; background-color: #ffd180; font-weight: 100; font-family: 'Roboto';}.container{text-align: center; display: table-cell; vertical-align: middle;}.content{text-align: center; display: inline-block;}.title{font-size: 72px; margin-bottom: 40px;}</style>
    <script type="text/javascript" src="//code.jquery.com/jquery-2.2.4.min.js"></script>
</head>
<body>
<div class="container">
    <div class="content">
        <div class="title">@lang('message.onemoment')</div>
        <strong>@lang('message.cleanup')</strong><br><br>
        <div class="progress" style="height:5px;">
            <div class="indeterminate"></div>
        </div>
        <a href="https://twitter.com/cDeckapp" class="twitter-follow-button" data-show-count="false" data-size="large">Follow @cDeckapp</a>
        <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
        <script>setInterval(function(){$(document).ready(function(){$.ajax({type:'GET',url: '/api/debug/ping',success:function(){location.reload()}})})}, 2000)</script>
    </div>
</div>
</body>
</html>