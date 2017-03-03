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
        },
        testNotification: function(){
            var testObject = {
                "event":"favorite",
                "created_at":"Mon Jan 09 16:48:32 +0000 2017",
                "source":{"id":4704843092,
                    "id_str":"4704843092",
                    "name":"Tiefer sKiL",
                    "screen_name":"deepskil",
                    "location":null,
                    "url":null,
                    "description":null,
                    "protected":true,
                    "followers_count":10,
                    "friends_count":8,
                    "listed_count":0,
                    "created_at":"Sun Jan 03 20:01:38 +0000 2016",
                    "favourites_count":14,
                    "utc_offset":3600,
                    "time_zone":"Bern",
                    "geo_enabled":false,
                    "verified":false,
                    "statuses_count":249,
                    "lang":"en",
                    "contributors_enabled":false,
                    "is_translator":false,
                    "is_translation_enabled":false,
                    "profile_background_color":"F5F8FA",
                    "profile_background_image_url":null,
                    "profile_background_image_url_https":null,
                    "profile_background_tile":false,
                    "profile_image_url":"http://pbs.twimg.com/profile_images/683741735940419584/NwKv2ElU_normal.png",
                    "profile_image_url_https":"https://pbs.twimg.com/profile_images/683741735940419584/NwKv2ElU_normal.png",
                    "profile_banner_url":"https://pbs.twimg.com/profile_banners/4704843092/1451851743",
                    "profile_link_color":"1DA1F2",
                    "profile_sidebar_border_color":"C0DEED",
                    "profile_sidebar_fill_color":"DDEEF6",
                    "profile_text_color":"333333",
                    "profile_use_background_image":true,
                    "default_profile":true,
                    "default_profile_image":false,
                    "following":null,
                    "follow_request_sent":null,
                    "notifications":null,
                    "translator_type":"none"
                },
                "target":{
                    "id":4056705459,
                    "id_str":"4056705459",
                    "name":"sKiL",
                    "screen_name":"therealskildust",
                    "location":"Dessau-Roßlau, Germany",
                    "url":"https://skildust.com",
                    "description":"Luna | 17 | #programmer and #sysadmin | mtf transgirl (she/her) | lead developer @cdeckapp | mainly german tweets | @MikaWoof 💘",
                    "protected":false,
                    "followers_count":276,
                    "friends_count":168,
                    "listed_count":1,
                    "created_at":"Tue Oct 27 23:33:43 +0000 2015",
                    "favourites_count":30411,
                    "utc_offset":3600,
                    "time_zone":"Berlin",
                    "geo_enabled":true,
                    "verified":false,
                    "statuses_count":1635,
                    "lang":"en",
                    "contributors_enabled":false,
                    "is_translator":false,
                    "is_translation_enabled":false,
                    "profile_background_color":"000000",
                    "profile_background_image_url":"http://pbs.twimg.com/profile_background_images/678327937716715520/MSIFzvqd.png",
                    "profile_background_image_url_https":"https://pbs.twimg.com/profile_background_images/678327937716715520/MSIFzvqd.png",
                    "profile_background_tile":false,
                    "profile_image_url":"http://pbs.twimg.com/profile_images/817430526697082880/QCQSEwzH_normal.jpg",
                    "profile_image_url_https":"https://pbs.twimg.com/profile_images/817430526697082880/QCQSEwzH_normal.jpg",
                    "profile_banner_url":"https://pbs.twimg.com/profile_banners/4056705459/1483127251",
                    "profile_link_color":"F58EA8",
                    "profile_sidebar_border_color":"000000",
                    "profile_sidebar_fill_color":"000000",
                    "profile_text_color":"000000",
                    "profile_use_background_image":true,
                    "default_profile":false,
                    "default_profile_image":false,
                    "following":null,
                    "follow_request_sent":null,
                    "notifications":null,
                    "translator_type":"none"
                },
                "target_object":{
                    "created_at":"Mon Jan 09 15:28:48 +0000 2017",
                    "id":818479642374008800,
                    "id_str":"818479642374008833",
                    "text":"Aufstehen oder nochmal schlafen 🤔",
                    "truncated":false,
                    "entities":{
                        "hashtags":[],
                        "symbols":[],
                        "user_mentions":[],
                        "urls":[]
                    },
                    "source":"<a href=\"http://twitter.com/download/android\" rel=\"nofollow\">Twitter for Android</a>",
                    "in_reply_to_status_id":null,
                    "in_reply_to_status_id_str":null,
                    "in_reply_to_user_id":null,
                    "in_reply_to_user_id_str":null,
                    "in_reply_to_screen_name":null,
                    "user":{
                        "id":4056705459,
                        "id_str":"4056705459",
                        "name":"sKiL",
                        "screen_name":"therealskildust",
                        "location":"Dessau-Roßlau, Germany",
                        "url":"https://skildust.com",
                        "description":"Luna | 17 | #programmer and #sysadmin | mtf transgirl (she/her) | lead developer @cdeckapp | mainly german tweets | @MikaWoof 💘",
                        "protected":false,
                        "followers_count":276,
                        "friends_count":168,
                        "listed_count":1,
                        "created_at":"Tue Oct 27 23:33:43 +0000 2015",
                        "favourites_count":30411,
                        "utc_offset":3600,
                        "time_zone":"Berlin",
                        "geo_enabled":true,
                        "verified":false,
                        "statuses_count":1635,
                        "lang":"en",
                        "contributors_enabled":false,
                        "is_translator":false,
                        "is_translation_enabled":false,
                        "profile_background_color":"000000",
                        "profile_background_image_url":"http://pbs.twimg.com/profile_background_images/678327937716715520/MSIFzvqd.png",
                        "profile_background_image_url_https":"https://pbs.twimg.com/profile_background_images/678327937716715520/MSIFzvqd.png",
                        "profile_background_tile":false,
                        "profile_image_url":"http://pbs.twimg.com/profile_images/817430526697082880/QCQSEwzH_normal.jpg",
                        "profile_image_url_https":"https://pbs.twimg.com/profile_images/817430526697082880/QCQSEwzH_normal.jpg",
                        "profile_banner_url":"https://pbs.twimg.com/profile_banners/4056705459/1483127251",
                        "profile_link_color":"F58EA8",
                        "profile_sidebar_border_color":"000000",
                        "profile_sidebar_fill_color":"000000",
                        "profile_text_color":"000000",
                        "profile_use_background_image":true,
                        "default_profile":false,
                        "default_profile_image":false,
                        "following":null,
                        "follow_request_sent":null,
                        "notifications":null,
                        "translator_type":"none"
                    },
                    "geo":null,
                    "coordinates":null,
                    "place":null,
                    "contributors":null,
                    "is_quote_status":false,
                    "retweet_count":0,
                    "favorite_count":4,
                    "favorited":false,
                    "retweeted":false,
                    "lang":"de"
                }
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