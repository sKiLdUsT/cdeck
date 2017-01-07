/*

    Name: cDeck JS Client
    Author: cDeck Team
    Description: Example Client for using the cDeck Websocket API written in Javascript
    Version: 0.7-pre
    Dependencies:   * jQuery (https://jquery.com/download/)
                    * Socket.io (http://socket.io/download/)
    License: BSD 3-Clause License (see LICENSE.md or http://bit.ly/2crw8Hj)

 */

(function( global ) {
    var self;

    // Define new Error-function to throw errors with.
    // You know, to make it look cool.
    function CDeckError( message ) {
        Error.apply( this, arguments );
        this.name = "cDeckError";
        this.message = ( message || "Non-specified error" );
    }

    // Initiate it.
    CDeckError.prototype = Object.create( Error.prototype );

    // Define our object
    var Cdeck = function( config ) {
        this.host = 'https://' + window.location.hostname;
        this.user = {};
        this.config = {
            tconfig_url: '/api/twitter/tconfig',
            uconfig_url: '/api/uconfig',
            lang_url: '/api/lang?lang=',
            upstream_url: '/api/upstream',
            user_url: '/api/twitter/getTokens'
        };
        this.version = '0.7-pre';
        // Set config if given
        if( typeof config == 'object' ){
            // Loop through keys
            for( var key in config){
                // Skip loop if the property is from prototype
                if ( ! config.hasOwnProperty( key ) ) continue;

                // Overwrite each original key with the custom config key, if it exists
                if ( this.config.hasOwnProperty( key ) ) this.config[ key ] = config[ key ];
            }
        }
        //Set instance reference
        self = this;
        return this;
    };

    // Initial function. Call this first to set up our environment.
    Cdeck.prototype.init = function ( config, callback ) {
        // Set config if given
        if( typeof config == 'object' ){
            for( var key in config){
                // Skip loop if the property is from prototype
                if ( ! config.hasOwnProperty( key ) ) continue;

                // Overwrite each original key with the custom config key, if it exists
                if ( this.config.hasOwnProperty( key ) ) this.config[ key ] = config[ key ];
            }
        }
        // Get Twitter-config.
        // cDeck calls the Twitter-API every 24h for this.
        // More: http://bit.ly/2cjQYc2
        // Only set when not previously defined.
        if ( window.tconfig === undefined ){
            $.get( this.config.tconfig_url, function ( data ) {
                if( data !== null ) {
                    window.tconfig = data;
                } else {
                    throw new CDeckError( 'tconfig is null. Contact server administrator.' );
                }
            }, 'json' );
        }

        // Get User-config
        // This returns some user-specific data.
        // See the API-Documentation at: https://developer.cdeck.net/api/rest
        // Only set when not previously defined.
        if ( window.uconfig === undefined ){
            $.get( this.config.uconfig_url, function ( data ) {
                if( data !== null ) {
                    window.uconfig = data;
                    if(data.activeID !== undefined){
                        $app.activeID = data.activeID;
                    }
                    // Set the Language from uconfig if recieved.
                    // Otherwise use language defined in the page HTML
                    // Only set if not previously defined
                    if( window.lang === undefined ){
                        if( data.lang !== undefined ){
                            $.ajax({
                                url: self.config.lang_url+data.lang,
                                async: true,
                                dataType: 'json',
                                success: function ( data ) {
                                    if( data !== null) {
                                        window.lang = data;
                                    } else {
                                        throw new CDeckError( 'Couldn\'t get lang file' );
                                    }
                                },
                                error: function(){
                                    throw new CDeckError( 'Couldn\'t get lang file' );
                                }
                            });
                        } else {
                            $.ajax({
                                url: self.config.lang_url+$('html').attr('lang'),
                                async: true,
                                dataType: 'json',
                                success: function ( data ) {
                                    if( data !== null ) {
                                        window.lang = data;
                                    } else {
                                        throw new CDeckError( 'Couldn\'t get lang file' );
                                    }
                                },
                                error: function(){
                                    throw new CDeckError( 'Couldn\'t get lang file' );
                                }
                            });
                        }
                    }
                } else {
                    throw new CDeckError( 'Couldn\'t recieve uconfig' );
                }

            }, 'json' );
        }
        //Check if callback is given and use it if so
        if( typeof callback === 'function' ){
            self.callback = callback;
        } else {
            self.callback = function(){};
            console.info( 'cDeck Client: no callback given' );
        }

        self = this;
        return this;
    };

    // The main piece here.
    // It connects to the cDeck Websocket-API and
    // Registers itself. After that, it receives various
    // Events, according to the API (see: https://developer.cdeck.net/api/rest/)
    Cdeck.prototype.connect = function ( id ) {
        var socket = io.connect({
            path: this.config.upstream_url,
            'force new connection' : true
            }),
            udata = {};

        // Get User information
        // This can't be done asynchronously.
        $.ajax({
            url: this.config.user_url,
            async: false,
            dataType: 'json',
            success: function ( response ) {
                udata = response;
            },
            error: function(){
                throw new CDeckError( 'User not existent or server error.' )
            }
        });

        // If id is not set, set it to default value
        // (id being the User-UID)
        if(id === undefined){
            id = 0;
        }

        this.user = udata[id];

        //Function for registering at the server.
        function register( user ) {
            // Emit "register" with the user-object specified by id
            socket.emit( 'register', user[id], function ( response ) {
                if ( response === true ) {
                    self.callback( 'client_register', true );
                } else {
                    if( response.error == "double connect" ){
                        console.log( "cDeck: Double Connect detected." );
                    }else{
                        socket.close();
                        self.callback( 'client_register', false );
                        throw new CDeckError( "Login failed: " + response.error );
                    }
                }
            });
        }
        //Set internal socket to current socket
        this.socket = socket;
        // Register
        register( udata );
        // The following functions deal with events
        // described in the cDeck Websocket-API (https://developer.cdeck.net/api/ws/)
        this.socket.on( 'reconnect', function () {
            // Emit event.
            // Instructions on how to handle this event used to be here.
            self.callback( 'client_reconnect' );
            register( udata );
        });
        this.socket.on( 'timeline', function (data) {
            // Emit event with data.
            // Instructions on how to use the data used to be here.
            self.callback( 'client_recievedData', data );
        });
        this.socket.on( 'connect_error', function () {
            // Emit event.
            // Instructions on how to handle this event used to be here.
           self.callback( 'client_reconnect' );
        });
        this.socket.on( 'reconnecting', function () {
            // Emit event.
            // Instructions on how to handle this event used to be here.
           self.callback( 'client_reconnecting' );
        });
        this.socket.on( 'reconnect_error', function () {
            // Emit event.
            // Instructions on how to handle this event used to be here.
           self.callback( 'client_reconn_error' );
        });
        this.socket.on( 'fatal_error', function( err ){
            throw new CDeckError( 'Server error: ' + err );
        });
        this.socket.on( 'ready', function(){
           self.callback( 'client_ready' );
        });
        self = this;
        return this;
    };

    // Function to post a new tweet
    Cdeck.prototype.postStatus = function ( data ) {
        // Only executes if socket is present.
        // Otherwise throws an error.
        if ( this.socket ) {
            this.socket.emit( 'postStatus', {tweet: data, api_token: this.user.api_token}, function ( response ) {
                if ( response.result === true ) {
                    // Instructions on how to handle this event used to be here.
                    self.callback( 'client_tweet_sent' );
                } else {
                    self.callback( 'client_tweet_error', response.twitter.message );
                    throw new CDeckError( 'Tweet failed: ' + response.twitter.message );
                }
            });
        } else {
            throw new CDeckError( 'No socket present' );
        }
        self = this;
        return this;
    };

    // Function to post a Retweet
    Cdeck.prototype.postRt = function ( id ) {
        // Only executes if socket is present.
        // Otherwise throws an error.
        if ( this.socket ) {
            this.socket.emit( 'postRt', {
                id: id,
                api_token: this.user.api_token
            }, function ( response ) {
                if ( response.result === true ) {
                    // Instructions on how to handle this event used to be here.
                    self.callback( 'client_retweet_sent', id );
                } else {
                    // Instructions on how to handle this event used to be here.
                    self.callback( 'client_tweet_error', modal );
                    throw new CDeckError( 'Retweet failed: ' + response.twitter.message );
                }
            });
        } else {
            throw new CDeckError( 'No socket present' );
        }
        self = this;
        return this;
    };

    // Function to like something
    Cdeck.prototype.postLike = function ( data ) {
        if ( this.socket ) {
            this.socket.emit( 'postLike', {
                id: data,
                api_token: this.user.api_token
                }, function ( response ) {

                    if ( response.result === true ) {
                        // Instructions on how to handle this event used to be here.
                        self.callback( 'client_like_sent', data );
                    } else {
                        throw new CDeckError( 'Like failed: ' + response.twitter.message );
                    }
            });
        }
        self = this;
        return this;
    };

    // Function to get tweets up to max_id
    Cdeck.prototype.getTweets = function( max_id ) {
        // Throw error if max_id is missing.
        if( max_id === undefined ){
            throw new CDeckError( 'max_id missing' );
        }
        this.socket.emit('getTweets', {
            max_id: max_id,
            api_token: this.user.api_token
        }, function( response ){
            // Emit event with data.
            // Instructions on how to use the data used to be here.
            self.callback( 'client_recievedData', response );
        });
        self = this;
        return this;
    };

    // Function to delete tweet
    Cdeck.prototype.removeTweet = function( id ){
        this.socket.emit( 'remove', {api_token: this.user.api_token, id: id}, function( response ){
            if(response.result == true){
                // Emit event.
                self.callback( 'client_removedTweet', response );
            } else {
                throw new CDeckError( 'Delete failed: ' + response.twitter.message );
            }
        });
    };

    Cdeck.prototype.getUserInfo = function( handle, callback ){
        this.socket.emit( 'getUser', {api_token: this.user.api_token, handle: handle}, function( response ){
            if(response.result == true){
                // Emit event.
                self.callback( 'client_gotUserInfo', response );
                // Also call custom callback, if given
                if(callback !== undefined && typeof callback == 'function'){
                    callback(response.data)
                }
            } else {
                self.callback( 'client_getUserInfoFailed', response );
                callback({failed: true, reason: response.twitter.message});
                throw new CDeckError( 'Getting user info failed: ' + response.twitter.message );
            }
        });
    };

    // Function to close the socket
    Cdeck.prototype.close = function(){
        this.socket.emit( 'disconnect', this.user.api_token );
        this.socket.destroy();
        self.callback( 'client_logout' );
        self = this;
        return this;
    };

    // Expose our constructor to the global object
    global.cDeckClient = Cdeck();
    global.cDeck = new Cdeck();

})( this );