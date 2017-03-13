<div id="highlights" class="modal @if(json_decode(Auth::user()->uconfig)->colormode == 1)grey darken-3 white-text @endif">
    <div class="wrapper">
        <div class="modal-content center-align">
            <h4></h4>
            <p>
                <ul id="staggered-test">
                    <li style="transform: translateX(0px); opacity: 0;">
                        <h4><a>Follow/Unfollow</a></h4>
                        <p>You can now follow/unfollow people.</p>
                    </li>
                    <li class="" style="transform: translateX(0px); opacity: 0;">
                        <h4><a>Notification tone</a></h4>
                        <p>There's a new sound for new desktop notifications.</p>
                    </li>
                    <li style="transform: translateX(0px); opacity: 0;">
                        <h4><a>Inline Images</a></h4>
                        <p>Images are now shown within the tweet card instead of on top. Also, fullscreen preview scaling problems have been fixed.</p>
                    </li>
                    <li style="transform: translateX(0px); opacity: 0;">
                        <h4><a>Frontend Rework</a></h4>
                        <p>We optimized our frontend code to improve stability and performance.</p>
                    </li>
                </ul>
            </p>
        </div>
    </div>
</div>