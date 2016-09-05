<?php App::setlocale(Request()->input('lang', (Auth::user() && isset(json_decode(Auth::user()->uconfig)->lang)) ? json_decode(Auth::user()->uconfig)->lang : \Vluzrmos\LanguageDetector\Facades\LanguageDetector::detect())); ?>
@extends('base')
@section('content')
<div class="container valign-wrapper">
    <div class="valign">
        <div class="row col s12">
            <div class="row">
                <div class="col s12 section red white-text z-depth-2 center-align valign center">
                    <h1>404</h1>
                </div>
                <div class="col s12 section white z-depth-2 center-align valign">
                    <h5>@lang('errors.404')</h5>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection