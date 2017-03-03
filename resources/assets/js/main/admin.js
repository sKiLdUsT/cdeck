if(window.location.pathname.match(/^.*(\/admin)/)){
    $(function(){
        $.get('/admin/get', function ( data ) {
            var selector = $('#anal');
            selector.html('<ul class="collapsible" data-collapsible="accordion"><li><div class="collapsible-header"><b>Realtime</b></div><div class="collapsible-body" id="realtime"><b>Currently Online users</b><canvas id="rUsers" width="'+selector.width()+'" height="400"></canvas></div></li></ul><h5>Overview of last month</h5><br><b>Total Page Views</b><br><canvas id="pageViews" width="'+selector.width()+'" height="400"></canvas><br><div class="divider"></div><br><b>Browsers used</b><br><canvas id="browsers" width="'+selector.width()+'" height="400"></canvas><br><div class="divider"></div><br><b>Origin countries</b><br><canvas id="countries" width="'+selector.width()+'" height="400"></canvas>');
            var pageViews = new Chart(selector.children('#pageViews'), {
                type: 'line',
                data: {
                    labels: data.pageViews.date,
                    datasets: [{
                        label: 'Total Page views',
                        data: data.pageViews.total
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero:true
                            }
                        }]
                    }
                }
            });
            var browsers = new Chart(selector.children('#browsers'), {
                type: 'pie',
                data: {
                    labels: data.browsers.type,
                    datasets: [{
                        data: data.browsers.total
                    }]
                }
            });
            var countries = new Chart(selector.children('#countries'), {
                type: 'pie',
                data: {
                    labels: data.countries.name,
                    datasets: [{
                        data: data.countries.total
                    }]
                }
            });
            cDeck.init({
                tconfig_url: $app.tconfig_url,
                uconfig_url: $app.uconfig_url,
                lang_url: $app.lang_url,
                upstream_url: $app.upstream_url,
                user_url: $app.user_url
            }, function(){});
            cDeck.connect($app.activeID);
            var rUsers;
            cDeck.socket.emit('analytics', cDeck.user.api_token, function(data) {
                var time = new Date().toLocaleTimeString();
                rUsers = new Chart($('#rUsers'), {
                    type: 'line',
                    data: {
                        labels: [time],
                        datasets: [{
                            label: 'Online users',
                            data: [data]
                        }]
                    },
                    options: {
                        responsive: false,
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true
                                }
                            }]
                        }
                    }
                });
            });
            setInterval(function() {
                cDeck.socket.emit('analytics', cDeck.user.api_token, function(data){
                    var time = new Date().toLocaleTimeString();
                    if(rUsers.data.datasets[0].data.length == 12){
                        rUsers.data.datasets[0].data.shift();
                        rUsers.data.labels.shift();
                    }
                    rUsers.data.labels.push(time);
                    rUsers.data.datasets[0].data.push(data);
                    rUsers.update();
                });
            }, 5000);
            $('.collapsible').collapsible();
        }, 'json');
    });
}

