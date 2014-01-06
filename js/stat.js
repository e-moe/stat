$(function() {
    var utils = {
            executeFunctionByName: function(functionName, context /*, args */) {
                var args = Array.prototype.slice.call(arguments).splice(2);
                var namespaces = functionName.split(".");
                var func = namespaces.pop();
                for(var i = 0; i < namespaces.length; i++) {
                    context = context[namespaces[i]];
                }
                return context[func].apply(this, args);
            }
        },
        app = {
            ip: {
                'desktop': '192.168.0.78',
                'htpc':    '192.168.0.39',
                'google':  '8.8.4.4',
                'bing':    '204.79.197.200',
                'yahoo':   '206.190.36.45'
            },
            updateInterval: 15000,
            api: 'api.php',
            update: function() {
                // all in one
                app.getData(['lan', 'top', 'sysinfo', 'uptime', 'hdd_temp', 'hdd_usage', 'hostname'], {'lan': app.ip});
            },
            init: function() {
                // one by one
                app.getData(['lan'], {'lan': app.ip});
                app.getData(['top']);
                app.getData(['sysinfo']);
                app.getData(['uptime']);
                app.getData(['hdd_temp']);
                app.getData(['hdd_usage']);
                app.getData(['hostname']);

                setInterval(app.update, app.updateInterval);
            },
            getData: function(components, params) {
                $.post("api.php", {'components': components, 'params': params}, function(data) {
                    app.parseApiResponse(data);
                });
            },
            parseApiResponse: function(data) {
                for (var c in data) {
                    utils.executeFunctionByName('api_' + c, app, data[c]);
                }
            },
            api_lan: function(data) {
                var html = '',
                    cols = 8;
                for (var n in data) {
                    var r = data[n].result,
                        align = Math.abs(cols - n.length),
                        name = sprintf('<span data-toggle="tooltip" data-placement="left" title="%s">%s</span>', r.ip, n),
                        cls = 'default',
                        status = false === r.latency ? 'offline' : 'online';
                    if (false !== r.latency) {
                        if (r.latency < 50) {
                            cls = 'success';
                        } else if (r.latency < 100) {
                            cls = 'warning';
                        } else {
                            cls = 'danger';
                        }
                    }
                    var latency = false === r.latency ? sprintf('<span class="label label-%s">%s</span>', cls, status) : sprintf('<span class="label label-%s" data-toggle="tooltip" data-placement="right" title="%s ms" >%s</span>', cls, r.latency, status);

                    html += sprintf('%s %-' + align + 's %s\n', name, '', latency);
                }
                $('.api-lan').html(html).find('span').tooltip();

            },
            api_top: function(data) {
                $('.api-top').html(data);
            },
            api_sysinfo: function(data) {
                var section_map = {
                        'cpu': '*** CPU Info',
                        'memory': '*** Memory',
                        'distribution': '*** Distr'
                    },
                    html = '\n';
                for (var s in data) {
                    var section = data[s];
                    html += '\n' + section_map[s] + '\n';
                    for (var k in section) {
                        html += sprintf('%-16s %s\n', k, section[k]);
                    }

                }
                $('.api-sysinfo').html(html.trim());
            },
            api_uptime: function(data) {
                var html = sprintf('%s\nUptime: %s', data.uname, data.uptime);
                $('.api-uptime').html(html);
            },
            api_hdd_temp: function(data) {
                var html = '';
                for (var h in data) {
                    var hdd = data[h],
                        deg = parseInt(hdd.deg, 10),
                        cls = 'success';
                    if (deg >= 60) {
                        cls = 'danger';
                    } else if (deg >= 50) {
                        cls = 'warning';
                    }
                    html += sprintf('%-9s <span class="label label-%s">%5s</span>  %s\n', hdd.dev, cls, hdd.deg, hdd.name);
                }
                $('.api-hdd_temp').html(html);
            },
            api_hdd_usage: function(data) {
                var html = 'Filesystem                      Size  Used  Avail  Use%  Mounted on\n';
                for (var h in data) {
                    var hdd = data[h],
                        use = parseInt(hdd.use),
                        cls = 'success';
                    if (use >= 90) {
                        cls = 'danger';
                    } else if (use >= 75) {
                        cls = 'warning';
                    }
                    html += sprintf('%-30s %5s %5s %6s  <span class=\"label label-%s\">%3s</span>  %s\n',
                        hdd.fs, hdd.size, hdd.used, hdd.avail, cls, hdd.use, hdd.mounted
                    );
                }
                $('.api-hdd_usage').html(html);
            },
            api_hostname: function(data) {
                $('.api-hostname').html(data);
            }
        };

    app.init();

});
