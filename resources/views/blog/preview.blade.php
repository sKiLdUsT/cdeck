@extends('base')
@section('content')
    <div class="section white center-align z-depth-2 post">
        <h2 id="title">{{$title}}</h2>
        <div class="divider"></div>
        <div id="userinfo" class="grey lighten-4 valign-wrapper center-align">
            <span class="valign">
                {{\Carbon\Carbon::now()->formatLocalized('%A, %d %B %Y')}}
                @lang('blog.from')
                {{Auth::user()->name}}
            </span>
        </div>
        <div class="divider"></div>
        <br>
        <p id="content">{!! $content !!}</p>
        <br>
    </div>
@endsection