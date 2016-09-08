@extends('base')
@section('content')
    <div class="container onepost">
        <div class="row">
            <div class="col s9">
                <div id="post-{{$post->id}}" class="section @if(Auth::user() && json_decode(Auth::user()->uconfig)->colormode == 1)grey darken-3 white-text @else white @endif center-align z-depth-2 post">
                    <h2 id="title">{{$post->title}}</h2>
                    <div class="divider"></div>
                    <div id="userinfo" class="grey @if(Auth::user() && json_decode(Auth::user()->uconfig)->colormode == 1)darken-2 white-text @else lighten-4 @endif valign-wrapper center-align">
                        <span class="valign">
                            {{\Carbon\Carbon::createFromFormat('Y-m-d H:i:s', $post->updated_at)->formatLocalized('%A, %d %B %Y')}}
                            @lang('blog.from')
                            {{$userinfo['name']}}
                        </span>
                        <img class="circle valign" style="margin-left: 1rem;" src="{{$userinfo['pb']}}">
                    </div>
                    <div class="divider"></div>
                    <br>
                    <div class="container">
                        <div id="content">
                            {!! $post->content !!}
                        </div>
                    </div>
                    <br>
                    <div class="divider"></div>
                    <div id="social" class="grey @if(Auth::user() && json_decode(Auth::user()->uconfig)->colormode == 1)darken-2 white-text @else lighten-4 @endif valign-wrapper center-align" style="height:3rem">
                        <span class="valign">
                            <a id="share-twitter" class="twitter-share-button button btn btn-medium blue popout"
                               href="https://twitter.com/intent/tweet?original_referer={{urlencode(url()->current())}}&text={{urlencode($title.'cDeck')}}&related={{$userinfo["handle"]}}&url={{urlencode(url()->current())}}&via=cdeckapp">
                                <img src="/assets/img/twitter-white-128.png" style="height: 25px;margin-top: 3px;;">Tweet</a>
                        </span>
                    </div>
                    <div class="divider"></div>
                    <br>
                    <div id="rm" class="left-align">
                        <a href="/blog" class="button btn btn-medium grey ajax-link">@lang('blog.back')</a>
                    </div>
                </div>
                <br>
            </div>
        </div>
    </div>
    @if(isset($level) && $level >= 1)
        <div class="fixed-action-btn horizontal" style="bottom: 45px; right: 24px;">
            <a class="btn-floating btn-large red" id="newBlog">
                <i class="large material-icons">mode_edit</i>
            </a>
        </div>
    @endif
@endsection