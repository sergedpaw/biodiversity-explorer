// The Template Loader. Used to asynchronously load templates located in separate .html files
window.templateLoader = {

    load: function(views, callback) {

        var deferreds = [];

        $.each(views, function(index, view) {
            if (window[view]) {
                deferreds.push($.get('template/' + view + '.html', function(data) {
                    window[view].prototype.template = _.template(data);
                }, 'html'));
            } else {
                console.log("view", view, "not found");
            }
        });

        $.when.apply(null, deferreds).done(callback);
    }

};