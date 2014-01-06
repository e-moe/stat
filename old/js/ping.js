define(["jquery"], function($) {
    return {
        run: function() {
            $(function() {
                var ip = {
                    'desctop': '192.168.0.78',
                    'htpc': '192.168.0.39'
                };
                for (var n in ip) {
                    (function(){
                        var name = n;
                        $.getJSON("ping.php", {'ip': ip[n]}, function( data ) {
                            if ( data.result && (false !== data.result.latency)) {
                                console.log(name + ' - ' + data.result.ip + ' - ' + data.result.latency);
                                $('#tab-lan .data').append(name + ' - ' + data.result.ip + ' - ' + data.result.latency + '\n');
                            }
                        });
                    })();
                }
            });
        }
    }
});
