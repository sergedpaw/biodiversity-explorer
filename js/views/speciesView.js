define([
    'jquery',
    'underscore',
    'backbone',
    'models/faunaSpeciesList',
    'models/floraSpeciesList',
    'text!templates/species.html',
    'views/species/taxonView'
], function ($, _, Backbone, FaunaList, FloraList, template, TaxonView) {

    function getSpeciesLabel(model) {
        return model.taxon() + ' (' + model.common() + ')';
    }

    return Backbone.View.extend({
        el: '#content',
        taxaValues: {
            fauna: [],
            flora: []
        },

        initialize: function () {
            this.fauna = new FaunaList();
            this.flora = new FloraList();
            this.setFaunaValues();
            this.setFloraValues();
            this.fauna.on("reset", this.setFaunaValues, this);
            this.flora.on("reset", this.setFloraValues, this);
        },

        render: function () {
            this.$el.html(_.template(template, {}));
            this.initBox();
        },

        initBox: function () {
            $("#species_input").autocomplete({
                source: _.bind(function (request, response) {
                    var allValues = this.taxaValues.fauna.concat(this.taxaValues.flora);
                    //delegate to the normal auto complete response
                    response($.ui.autocomplete.filter(allValues, request.term));
                }, this),

                select: _.bind(function (event, ui) {
                    this.showSummary(ui.item.category, ui.item.value);
                }, this)
            });
        },

        setFaunaValues: function () {
            if (this.fauna && !this.fauna.isEmpty()) {
                this.taxaValues.fauna = this.buildTaxaValues(this.fauna, 'fauna');
            }
        },

        setFloraValues: function () {
            if (this.flora && !this.flora.isEmpty()) {
                this.taxaValues.flora = this.buildTaxaValues(this.flora, 'flora');
            }
        },

        buildTaxaValues: function (collection, category) {
            return collection.map(function (model) {
                return {
                    value: model.taxon(),
                    label: getSpeciesLabel(model),
                    category: category
                };
            });
        },

        showSummary: function (category, taxon) {
            var collection, model, records, view;
            collection = category === 'fauna' ? this.fauna : this.flora;
            model = collection.find(function (model) {
                return model.taxon() === taxon;
            });
            if (model) {
                records = model.records();
                // group by region
                records = _(records)
                    .groupBy(function (r) {
                        return r.get('SCALE');
                    })
                    .value();
                // clear previous tables
                this.$el.find('summary_content').html('');
                this.$el.find('details_content').html('');
                view = new TaxonView({model: records, label: getSpeciesLabel(model)});
                view.render();
            }
        }
    });
});