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
            },
            isLocalIP: function (ip) {
                return (0 === ip.indexOf('192.168.')) || (0 === ip.indexOf('172.16.')) || (0 === ip.indexOf('10.')) || (0 === ip.indexOf('127.'));
            }
        },
        bootstrap = {
            alertTimeout: 5000,
            showAlert: function ($domElem, html, timeout) {
                var timeOut = timeout || bootstrap.alertTimeout,
                    id = 'alert-' + Date.now(),
                    tmpl = '<div id="%s" class="alert alert-warning alert-dismissable">' +
                        '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' +
                        '%s</div>';
                $domElem.append(sprintf(tmpl, id, html));
                setTimeout(function () { $('#' + id).remove(); }, timeOut);
            },
            wrapLabel: function (value, format, lo, hi) {
                var val = parseFloat(value),
                    cls = 'success';
                if (val >= hi) {
                    cls = 'danger';
                } else if (val >= lo) {
                    cls = 'warning';
                }
                return sprintf('<span class="label label-%s">' + format + '</span>', cls, value);
            }
        },
        app = {
            ip: {
                'desktop': '192.168.0.78',
                'htpc':    '192.168.0.72',
                'google':  '8.8.4.4',
                'bing':    '204.79.197.200',
                'yahoo':   '206.190.36.45'
            },
            updateInterval: 15000,
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
            api_lan: function (data) {
                var html = '',
                    cols = 8,
                    n,
                    r,
                    latency,
                    align,
                    name,
                    cls,
                    status,
                    isLocal;
                for (n in data) { if (data.hasOwnProperty(n)) {
                    r = data[n].result;
                    align = Math.abs(cols - n.length);
                    name = sprintf('<span data-toggle="tooltip" data-placement="left" title="%s">%s</span>', r.ip, n);
                    cls = 'default';
                    status = false === r.latency ? 'offline' : 'online';
                    isLocal = utils.isLocalIP(r.ip);
                    if (false !== r.latency) {
                        if (r.latency < 50) {
                            cls = 'success';
                        } else if (r.latency < 100) {
                            cls = 'warning';
                        } else {
                            cls = 'danger';
                        }
                    }
                    latency = sprintf('<span class="label label-%s">%s</span>', cls, status);
                    if (isLocal) {
                        latency = sprintf('<a href="#" data-placement="right" title="Wake up" class="label label-%s" data-toggle="modal" data-target="#wol-modal">%s</a>', cls, status);
                    }
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
                    proc;
                for (p in data) { if (data.hasOwnProperty(p)) {
                    proc = data[p];
                    html += sprintf('%5s %-8s %3s %3s %5s %4s %4s %s %s %s %9s %s\n',
                        proc.pid, proc.user, proc.pr, proc.ni, proc.virt, proc.res, proc.shr, proc.s,
                        bootstrap.wrapLabel(proc.cpu, '%4s', 55, 75),
                        bootstrap.wrapLabel(proc.mem, '%4s', 40, 70),
                        proc.time, proc.cmd
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
                    hdd;
                for (h in data) { if (data.hasOwnProperty(h)) {
                    hdd = data[h];
                    html += sprintf('%-9s %s  %s\n', hdd.dev, bootstrap.wrapLabel(hdd.deg, '%5s', 50, 60), hdd.name);
                } }
                $('.api-hdd_temp').html(html);
            },
            api_hdd_usage: function (data) {
                var html = 'Filesystem                      Size  Used  Avail  Use%  Mounted on\n',
                    h,
                    hdd;
                for (h in data) { if (data.hasOwnProperty(h)) {
                    hdd = data[h];
                    html += sprintf('%-30s %5s %5s %6s  %s  %s\n',
                        hdd.fs, hdd.size, hdd.used, hdd.avail, bootstrap.wrapLabel(hdd.use, '%3s', 75, 90), hdd.mounted
                        );
                } }
                $('.api-hdd_usage').html(html);
            },
            api_hostname: function (data) {
                $('.api-hostname').html(data);
            },
            api_wol: function (data) {
                bootstrap.showAlert($('.alerts'), data);
            }
        };

    app.init();

});
