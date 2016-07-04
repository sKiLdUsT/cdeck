@extends('base')
@section('content')
    <main class="hide-on-small-and-down">
        <div class="row">
            <div class="parallax-container">
                <div class="parallax"><img src="images/parallax1.jpg"></div>
            </div>
            <div class="section white">
                <div class="row container center-align">
                    <p class="grey-text text-darken-3 lighten-3">Gib deinen Beta-Key ein</p>
                    <div class="divider"></div><br>
                    <div class="row">
                        <form class="col s6 push-s3 ajax-form" method="post" action="/auth/beta">
                            <span class="red-text">{{ session('status') ?: ''}}</span>
                            <div class="row">
                                <div class="input-field col s12">
                                    <input id="text" class="materialize-input" length="32" name="key" />
                                    <label for="text">Beta Token</label>
                                    <input type="hidden" name="_token" value="{{ csrf_token() }}">
                                </div>
                                <button class="btn waves-effect waves-light blue" type="submit">Senden<i class="material-icons right">send</i> </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div class="parallax-container">
                <div class="parallax"><img src="images/parallax2.jpg"></div>
            </div>
        </div>
    </main>
@endsection