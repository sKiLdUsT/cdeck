@extends('base')
@section('content')
    <div class="section @if(Auth::user() && json_decode(Auth::user()->uconfig)->colormode == 1)grey darken-3 white-text @else white @endif center-align z-depth-2 post">
        <h2 id="title">{{$title}}</h2>
        <div class="divider"></div>
        <div id="userinfo" class="grey @if(Auth::user() && json_decode(Auth::user()->uconfig)->colormode == 1)darken-2 white-text @else lighten-4 @endif valign-wrapper center-align">
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