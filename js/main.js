require.config({
    baseUrl: "js",
    paths: {
        "jquery": "jquery-2.0.3.min",
        "jqueryui": "//ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min"
    },
    shim: {
        "jqueryui": ["jquery"]
    }
});

require(['./app', './ping'], function(app, ping) {
    app.init();
    ping.run();
});
