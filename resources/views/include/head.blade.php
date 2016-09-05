    <meta charset="UTF-8"/>
    <title>{{$title or ""}}cDeck</title>
    <meta name="description" content="Modern and intelligent Twitter client">
    <meta name="language" content="de">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta property="og:title" content="{{$title}}cDeck">
    <meta property="og:description" content="Modern and intelligent Twitter client">
    <meta property="og:image" content="{{url()->to('/assets/img/icon/ms-icon-310x310.png')}}" >
    @if(isset($onepost))
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="{{$post->title}} - cDeck Blog" />
        <meta name="twitter:creator" content="{{'@'.$userinfo['handle']}}">
        <meta name="twitter:description" content="@if(strlen($post->content) > 137){{substr($post->content, 0, 137).'...'}} @else {{$post->content}} @endif" />
    @elseif(isset($voice))
        <meta name="twitter:card" content="player" />
        <meta name="twitter:creator" content="{{'@'.$user->handle}}">
        <meta name="twitter:image" content="{{str_replace('_normal', '', $user->avatar)}}" />
        <meta name="twitter:player" content="{{url()->current()}}" />
        <meta name="twitter:player:width" content="490" />
        <meta name="twitter:player:height" content="375" />
        <meta name="twitter:player:stream" content="{{url()->to($url)}}" />
        <meta name="twitter:player:stream:content_type" content="audio/mpeg" />
        <meta property="og:type" content="video">
        <meta property="og:video:url" content="{{url()->current()}}">
        <meta property="og:video:secure_url" content="{{url()->current()}}">
        <meta property="og:video:type" content="text/html">
        <meta property="og:video:width" content="490">
        <meta property="og:video:height" content="375">
    @else
        <meta name="twitter:card" content="summary_large_image" />
    @endif
    <meta name="twitter:site" content="@@cdeckapp" />
    <meta name="twitter:url" content="{{url()->current()}}" />
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
    <meta name="msapplication-TileImage" content="/assets/img/icon/ms-icon-144x144.png">
    <meta name="theme-color" content="#ffffff">