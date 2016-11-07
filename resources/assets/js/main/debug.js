$(function( ) {
    window.cdebug = {
        testTweet: function(object){
            var testObject = {
                "created_at": "Wed Jun 06 20:07:10 +0000 2012",
                "id_str": "210462857140252672",
                "entities": {
                    "urls": [],
                    "hashtags": [],
                    "user_mentions": []
                },
                "in_reply_to_user_id_str": null,
                "text": "This is a test tweet!",
                "retweet_count": 66,
                "in_reply_to_status_id_str": null,
                "id": 1,
                "geo": null,
                "retweeted": false,
                "possibly_sensitive": false,
                "in_reply_to_user_id": null,
                "place": null,
                "user": {
                    "profile_sidebar_fill_color": "DDEEF6",
                    "profile_sidebar_border_color": "C0DEED",
                    "profile_background_tile": false,
                    "name": "cDek API Test",
                    "profile_image_url": "/assets/img/logo.png",
                    "created_at": "Wed May 23 06:01:13 +0000 2007",
                    "location": "",
                    "follow_request_sent": false,
                    "profile_link_color": "0084B4",
                    "is_translator": false,
                    "id_str": "6253282",
                    "entities": {
                        "url": {
                            "urls": []
                        },
                        "description": {
                            "urls": []
                        }
                    },
                    "profile_image_url_https": "/assets/img/logo.png",
                    "utc_offset": -28800,
                    "id": 6253282,
                    "profile_use_background_image": true,
                    "listed_count": 10774,
                    "profile_text_color": "333333",
                    "lang": "en",
                    "followers_count": 1212963,
                    "protected": false,
                    "notifications": null,
                    "profile_background_image_url_https": "https://si0.twimg.com/images/themes/theme1/bg.png",
                    "profile_background_color": "C0DEED",
                    "verified": true,
                    "geo_enabled": true,
                    "time_zone": "Pacific Time (US & Canada)",
                    "description": "cDeck API Debug Test",
                    "default_profile_image": false,
                    "profile_background_image_url": "http://a0.twimg.com/images/themes/theme1/bg.png",
                    "statuses_count": 3333,
                    "friends_count": 31,
                    "following": true,
                    "show_all_inline_media": false,
                    "screen_name": "api"
                },
                "in_reply_to_screen_name": null,
                "source": "api",
                "in_reply_to_status_id": null
            };
            if( typeof object == 'object' ){
                for( var key in object){
                    // Skip loop if the property is from prototype
                    if ( ! object.hasOwnProperty( key ) ) continue;

                    // Overwrite each original key with the custom config key, if it exists
                    if ( testObject.hasOwnProperty( key ) ) testObject[ key ] = object[ key ];
                }
            }
            cDeckInit('client_recievedData', [testObject])
        }
    };
});