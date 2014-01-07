/*jslint browser: true, plusplus: true */
/*global $: false, sprintf: false*/
$(function () {
    'use strict';
    var utils = {
            executeFunctionByName: function (functionName, context) {
                var args = Array.prototype.slice.call(arguments).splice(2),
                    namespaces = functionName.split("."),
                    func = namespaces.pop(),
                    i;
                for (i = 0; i < namespaces.length; i++) {
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
            alertTimeout: 5000,
            api: 'api.php',
            update: function () {
                // all in one
                app.getData(
                    ['lan', 'top', 'sysinfo', 'uptime', 'hdd_temp', 'hdd_usage', 'hostname'],
                    {'lan': app.ip}
                );
            },
            init: function () {
                // one by one
                app.getData(['lan'], {'lan': app.ip});
                app.getData(['top']);
                app.getData(['sysinfo']);
                app.getData(['uptime']);
                app.getData(['hdd_temp']);
                app.getData(['hdd_usage']);
                app.getData(['hostname']);

                setInterval(app.update, app.updateInterval);

                $('#wol-modal').on('show.bs.modal', function (e) {
                    var $span = $(e.relatedTarget).prev(),
                        alias = $span.text(),
                        ip = $span.data('original-title');
                    $('.wol-alias').text(alias);
                    $('.api-wol').data('alias', alias);
                });
                $('.api-wol').click(function () {
                    var alias = $(this).data('alias');
                    app.getData(['wol'], {'wol': alias});
                });
            },
            getData: function (components, params) {
                $.post("api.php", {'components': components, 'params': params}, function (data) {
                    app.parseApiResponse(data);
                });
            },
            parseApiResponse: function (data) {
                var c;
                for (c in data) { if (data.hasOwnProperty(c)) {
                    utils.executeFunctionByName('api_' + c, app, data[c]);
                } }
            },
            showAlert: function (html, timeout) {
                var timeOut = timeout || app.alertTimeout,
                    id = 'alert-' + Date.now(),
                    tmpl = '<div id="%s" class="alert alert-warning alert-dismissable">' +
                        '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' +
                        '%s</div>';
                $('.alerts').append(sprintf(tmpl, id, html));
                setTimeout(function () { $('#' + id).remove(); }, timeOut);
            },
            api_lan: function (data) {
                var html = '',
                    cols = 8,
                    n,
                    r,
                    latency,
                    align,
                    name,
                    cls,
                    status;
                for (n in data) { if (data.hasOwnProperty(n)) {
                    r = data[n].result;
                    align = Math.abs(cols - n.length);
                    name = sprintf('<span data-toggle="tooltip" data-placement="left" title="%s">%s</span>', r.ip, n);
                    cls = 'default';
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
                    latency = sprintf('<a href="#" data-placement="right" title="Wake up" class="label label-%s" data-toggle="modal" data-target="#wol-modal">%s</a>', cls, status);
                    if (false !== r.latency) {
                        latency = sprintf('<span class="label label-%s" data-placement="right" title="%d ms" >%s</span>',
                            cls, r.latency, status
                            );
                    }

                    html += sprintf('%s %-' + align + 's %s\n', name, '', latency);
                } }
                $('.api-lan').html(html).find('span, a').tooltip();

            },
            api_top: function (data) {
                var html = '  PID USER      PR  NI  VIRT  RES  SHR S %CPU %MEM     TIME+ COMMAND\n',
                    p,
                    proc,
                    cpu_cls,
                    mem_cls;
                for (p in data) { if (data.hasOwnProperty(p)) {
                    proc = data[p];
                    cpu_cls = 'success';
                    if (proc.cpu >= 75) {
                        cpu_cls = 'danger';
                    } else if (proc.cpu >= 55) {
                        cpu_cls = 'warning';
                    }
                    mem_cls = 'success';
                    if (proc.mem >= 40) {
                        mem_cls = 'danger';
                    } else if (proc.mem >= 70) {
                        mem_cls = 'warning';
                    }
                    html += sprintf('%5s %-8s %3s %3s %5s %4s %4s %s <span class="label label-%s">%4s</span> <span class="label label-%s">%4s</span> %9s %s\n',
                        proc.pid, proc.user, proc.pr, proc.ni, proc.virt, proc.res, proc.shr, proc.s, cpu_cls, proc.cpu, mem_cls, proc.mem, proc.time, proc.cmd
                        );
                } }
                $('.api-top').html(html);
            },
            api_sysinfo: function (data) {
                var section_map = {
                        'cpu': '*** CPU Info',
                        'memory': '*** Memory',
                        'distribution': '*** Distr'
                    },
                    html = '\n',
                    s,
                    section,
                    k;
                for (s in data) { if (data.hasOwnProperty(s)) {
                    section = data[s];
                    html += '\n' + section_map[s] + '\n';
                    for (k in section) { if (section.hasOwnProperty(k)) {
                        html += sprintf('%-16s %s\n', k, section[k]);
                    } }
                } }
                $('.api-sysinfo').html(html.trim());
            },
            api_uptime: function (data) {
                var html = sprintf('%s\nUptime: %s', data.uname, data.uptime);
                $('.api-uptime').html(html);
            },
            api_hdd_temp: function (data) {
                var html = '',
                    h,
                    hdd,
                    deg,
                    cls;
                for (h in data) { if (data.hasOwnProperty(h)) {
                    hdd = data[h];
                    deg = parseInt(hdd.deg, 10);
                    cls = 'success';
                    if (deg >= 60) {
                        cls = 'danger';
                    } else if (deg >= 50) {
                        cls = 'warning';
                    }
                    html += sprintf('%-9s <span class="label label-%s">%5s</span>  %s\n',
                        hdd.dev, cls, hdd.deg, hdd.name
                        );
                } }
                $('.api-hdd_temp').html(html);
            },
            api_hdd_usage: function (data) {
                var html = 'Filesystem                      Size  Used  Avail  Use%  Mounted on\n',
                    h,
                    hdd,
                    use,
                    cls;
                for (h in data) { if (data.hasOwnProperty(h)) {
                    hdd = data[h];
                    use = parseInt(hdd.use, 10);
                    cls = 'success';
                    if (use >= 90) {
                        cls = 'danger';
                    } else if (use >= 75) {
                        cls = 'warning';
                    }
                    html += sprintf('%-30s %5s %5s %6s  <span class=\"label label-%s\">%3s</span>  %s\n',
                        hdd.fs, hdd.size, hdd.used, hdd.avail, cls, hdd.use, hdd.mounted
                        );
                } }
                $('.api-hdd_usage').html(html);
            },
            api_hostname: function (data) {
                $('.api-hostname').html(data);
            },
            api_wol: function (data) {
                app.showAlert(data);
            }
        };

    app.init();

});
