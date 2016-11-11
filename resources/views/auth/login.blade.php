@extends('base')
@section('content')
    <main>
        <div class="valign-wrapper" style="height: calc(100vh - 64px);">
            <div class="valign">
                <div class="section z-depth-2 row white" style="width: 100vw;">
                    <div class="col s3 push-s3">
                        <p>
                            {{trans('message.homedesc')}}
                        </p>
                    </div>
                    <div class="col s3 push-s3 center-align">
                        <p class="grey-text text-darken-3 lighten-3">{!! trans('message.homewarning') !!}</p>
                        <div class="divider"></div><br>
                        <a href="/auth/twitter">
                            <button class="btn waves-effect waves-light blue"><img src="/assets/img/twitter-36.png" style="float:left"/>Login via Twitter
                            </button>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </main>
@endsection