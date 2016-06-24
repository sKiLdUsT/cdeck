@extends('base')
@section('content')
    <main class="hide-on-small-and-down">
        <div class="row">
            <div class="parallax-container">
                <div class="parallax"><img src="images/parallax1.jpg"></div>
            </div>
            <div class="section white">
                <div class="row container center-align">
                    <h2 class="header">Informationen</h2>
                    <p class="grey-text text-darken-3 lighten-3">Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc</p>
                    <div class="divider"></div><br>
                    <a href="/auth/twitter">
                        <button class="btn waves-effect waves-light blue btn-block">Login via Twitter
                            <img src="/assets/img/twitter-128.png" style="width:30px;height:30px;" />
                        </button>
                    </a>
                </div>
            </div>
            <div class="parallax-container">
                <div class="parallax"><img src="images/parallax2.jpg"></div>
            </div>
        </div>
    </main>
@endsection