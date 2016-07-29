@extends('base')
@section('content')
    <main>
        <div class="row">
            <div class="parallax-container" style="height: 250px">
                <div class="parallax"><img src="images/parallax1.jpg"></div>
            </div>
            <div class="section white">
                <div class="row container center-align">
                    <h2 class="header">Information</h2>
                    <p class="grey-text text-darken-3 lighten-3">Dieser Client befindet sich immer noch in der <b>BETA</b>-Phase. Er könnte eure Katze töten oder euer Haus anzünden.<br><br>Benutzen auf eigene Gefahr!</p>
                    <div class="divider"></div><br>
                    <a href="/auth/twitter">
                        <button class="btn waves-effect waves-light blue btn-block">Login via Twitter
                            <img src="/assets/img/twitter-128.png" style="width:30px;height:30px;" />
                        </button>
                    </a>
                </div>
            </div>
        </div>
    </main>
@endsection