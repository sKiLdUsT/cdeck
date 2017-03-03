@extends('base')
@section('content')
    <div class="container center white black-text">
        <br>
        <h3>Admin Area</h3><br>
        <br>
        <div class="divider"></div>
        <br>
        <div class="container">
            <div class="row">
                <div class="col s12">
                    <ul class="tabs">
                        <li class="tab col s3"><a class="active" href="#anal">Analytics</a></li>
                        <li class="tab col s3"><a href="#stats">Instance Info</a></li>
                        <li class="tab col s3"><a href="#users">Registered Users</a></li>
                    </ul>
                </div>
                <div id="anal" class="col s12">
                    <p>
                        <div class="preloader-wrapper big active">
                            <div class="spinner-layer spinner-blue">
                                <div class="circle-clipper left">
                                    <div class="circle"></div>
                                </div><div class="gap-patch">
                                    <div class="circle"></div>
                                </div><div class="circle-clipper right">
                                    <div class="circle"></div>
                                </div>
                            </div>
                            <div class="spinner-layer spinner-red">
                                <div class="circle-clipper left">
                                    <div class="circle"></div>
                                </div><div class="gap-patch">
                                    <div class="circle"></div>
                                </div><div class="circle-clipper right">
                                    <div class="circle"></div>
                                </div>
                            </div>
                            <div class="spinner-layer spinner-yellow">
                                <div class="circle-clipper left">
                                    <div class="circle"></div>
                                </div><div class="gap-patch">
                                    <div class="circle"></div>
                                </div><div class="circle-clipper right">
                                    <div class="circle"></div>
                                </div>
                            </div>
                            <div class="spinner-layer spinner-green">
                                <div class="circle-clipper left">
                                    <div class="circle"></div>
                                </div><div class="gap-patch">
                                    <div class="circle"></div>
                                </div><div class="circle-clipper right">
                                    <div class="circle"></div>
                                </div>
                            </div>
                        </div>
                    </p>
                </div>
                <div id="stats" class="col s12">
                    <p><b>Instance hostname</b>: {{ gethostname() }}</p>
                    <p><b>Instance kernel</b>: {{ exec('uname -svr') }}</p>
                    <p><b>Instance os type</b>: {{ exec('uname -om') }}</p>
                    <p><b>Instance cpu</b>: {{ substr(file('/proc/cpuinfo')[4], 13) }}</p>
                </div>
                <div id="users" class="col s12">
                    <ul class="collapsible popout left-align" data-collapsible="accordion">
                        @foreach(\App\User::all() as $user)
                            <li>
                                <div class="collapsible-header"><b>{{ $user->id }} - {{ '@'.$user->handle }}</b></div>
                                <div class="collapsible-body">
                                    <p style="padding:1em"><b>Twitter name</b>: {{ base64_decode($user->name) }}</p>
                                    <p style="padding:1em"><b>Twitter handle</b>: {{ $user->handle }}</p>
                                    <p style="padding:1em"><b>Twitter id</b>: {{ $user->twitter_id }}</p>
                                    <p style="padding:1em"><b>API token</b>: {{ $user->api_token }}</p>
                                    <ul class="collapsible left-align" data-collapsible="accordion">
                                        <li>
                                            <div class="collapsible-header">Raw</div>
                                            <div class="collapsible-body">
                                                <pre><code class="language-json">{{ json_encode($user, JSON_PRETTY_PRINT) }}</code></pre>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </li>
                        @endforeach
                    </ul>
                </div>
            </div>
        </div>
        <br>
    </div>
@endsection