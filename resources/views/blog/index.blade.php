@extends('base')
@section('content')
<div class="container">
    <div class="row">
        <div class="col s9">
            @unless(isset($error))
            @foreach(array_reverse($content) as $post)
                <div id="post-{{$post->id}}" class="section white center-align z-depth-2 post">
                    <h2 id="title">{{$post->title}}</h2>
                    <div class="divider"></div>
                    <div id="userinfo" class="grey lighten-4 valign-wrapper center-align">
                        <span class="valign">{{\Carbon\Carbon::createFromFormat('Y-m-d H:i:s', $post->updated_at)->formatLocalized('%A, %d %B %Y')}}
                        @lang('blog.from')
                        {{$userinfo[$post->uid]['name']}}</span>
                        <img class="circle valign" style="margin-left: 1rem;" src="{{$userinfo[$post->uid]['pb']}}">
                    </div>
                    <div class="divider"></div>
                    <br>
                    <div class="container">
                        <p id="content">@if(strlen($post->content) > 250){!! substr($post->content, 0, 249).'...' !!} @else {!! $post->content !!} @endif</p>
                    </div>
                    <br>
                    <div id="rm" class="right-align">
                        <a href="/blog/post/{{$post->id}}" class="button btn btn-medium grey ajax-link">@lang('blog.readmore')</a>
                    </div>
                </div>
                <br>
            @endforeach
            @unless($page["all"] == 1)
                <div id="pagination" class="section white center-align z-depth-2 post">
                    <ul class="pagination">
                        <li class="@if($page["current"] == 1) disabled @else waves-effect @endif"><a class="ajax-link" href="{{$page["current"] != 1 ? '/blog/'.($page["current"] - 1) : "#"}}"><i class="material-icons">chevron_left</i></a></li>
                    @for($count = 1; $count <= $page["all"]; $count++)
                        <li class="@if($page["current"] == $count)active @else waves-effect @endif"><a class="ajax-link" href="/blog/{{$count}}">{{$count}}</a></li>
                    @endfor
                    <li class="@if($page["current"] == $page["all"]) disabled @else waves-effect @endif"><a class="ajax-link" href="{{$page["current"] != $page["all"] ? '/blog/'.($page["current"] + 1) : "#"}}"><i class="material-icons">chevron_right</i></a></li>
                    </ul>
                </div>
            @endunless
            @endunless
            @unless(!isset($error))
                    <div id="error" class="section red white-text center-align z-depth-2 post">
                        <h2>{!! $error !!}</h2>
                    </div>
            @endunless
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