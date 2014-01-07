define(["jquery", "jqueryui"], function($) {
    return {
        init: function() {
            $(function() {
                $("#tabs").tabs();
            });
        }
    }
});
