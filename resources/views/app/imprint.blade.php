@extends('base')
@section('content')
    <div class="container center white black-text">
        <br>
        <h3>@lang('disclaimer.imprint')</h3><br>
        <b>@lang('disclaimer.t1')</b><br>
        <br>

        <br>
        <h5>@lang('disclaimer.this')</h5>
        <div class="divider"></div><br>
        <b>@lang('disclaimer.content')</b>
        <br><br>
        @lang('disclaimer.t2')
        <br><br>
        <b>@lang('disclaimer.links')</b>
        <br><br>
        @lang('disclaimer.t3')
        <br><br>
        <b>@lang('disclaimer.copyright')</b>
        <br><br>
        @lang('disclaimer.t4')
        <br>
    </div>
    <br>
@endsection