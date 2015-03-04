define([
    'jquery',
    'underscore',
    'backbone',
    'app/tableFacade',
    'app/filters',
    'dataSources'
], function ($, _, Backbone, tables, filters, dataSources) {

    function extractTaxonGroup(tt_schedule) {
        if (tt_schedule && tt_schedule.indexOf(':') !== -1) {
            return tt_schedule.split(':')[1];
        }
        else {
            return tt_schedule;
        }
    }

    function getPastPressures(records, region, group) {
        return _(records)
            .filter(function (rec) {
                return rec.get('SCALE') === region
                    && rec.get('TT_SCHEDULE') === group
                    && filters.notEmpty(rec.get('TT_PASTPRESSURES_CAT'));
            })
            .map(function (r) {
                return r.get('TT_PASTPRESSURES_CAT');
            })
            .groupBy(function (r) {
                return r;
            })
            .map(function (values, pressure) {
                return {
                    pressure: pressure,
                    count: values.length
                }
            })
            .sortBy(function (o) {
                return -o.count;
            })
            .value();
    }

    return Backbone.View.extend({
        el: '#Q71',

        _cellTemplate: _.template(
            '<ul><% _.forEach(values, function(value) { %><li"><%- value.pressure %> : <%- value.count %></li><% }); %></ul>'),

        initialize: function () {

        },

        render: function () {
            dataSources.fauna.onReady(_.bind(this.renderFauna, this));
            dataSources.flora.onReady(_.bind(this.renderFlora, this));
        },

        renderFauna: function (collection, records) {
            records = _(records)
                .filter(function (r) {
                    return filters.notEmpty(r.get('TT_PASTPRESSURES_CAT'));
                })
                .value();
            // find group (col TT_SCHEDULE)
            var byGroup = _(records)
                .groupBy(function (r) {
                    return r.get('TT_SCHEDULE');
                })
                .value();
            var groups = _.keys(byGroup);
            console.log('groups', byGroup);
            var byRegion = _(records)
                .groupBy(function (r) {
                    return r.get('SCALE');
                })
                .value();
            var regions = _.keys(byRegion);
//            console.log('regions', byRegion);
            var rows = [];

            rows = _(regions)
                .map(function (region) {
                    var row = {};
                    row.region = region;
                    _.each(groups, function (group) {
                        var pastPressures = getPastPressures(records, region, group);
//                        console.log('pastPressure for', region, group, '=', pastPressures);
                        row[group] = pastPressures;
                    });


                    return row;
                })
                .value();

//            console.log('rows', rows);

            var columnDefs = this.buildColumnDefinitions(groups);
//            console.log('columns', columnDefs);
            var table = tables.initTable('#table_q71_fauna', {}, columnDefs);

//            console.log("fauna rows", rows);
            table.populate(rows);
        },

        renderFlora: function (collection, records) {
            records = _(records)
                .filter(function (r) {
                    return filters.notEmpty(r.get('TT_PASTPRESSURES_CAT'));
                })
                .value();
            // find group (col TT_SCHEDULE)
            var byGroup = _(records)
                .groupBy(function (r) {
                    return r.get('TT_SCHEDULE');
                })
                .value();
            var groups = _.keys(byGroup);
//            console.log('groups', byGroup);
            var byRegion = _(records)
                .groupBy(function (r) {
                    return r.get('SCALE');
                })
                .value();
            var regions = _.keys(byRegion);
//            console.log('regions', byRegion);
            var rows = [];

            rows = _(regions)
                .map(function (region) {
                    var row = {};
                    row.region = region;
                    _.each(groups, function (group) {
                        var pastPressures = getPastPressures(records, region, group);
//                        console.log('pastPressure for', region, group, '=', pastPressures);
                        row[group] = pastPressures;
                    });


                    return row;
                })
                .value();

//            console.log('rows', rows);

            var columnDefs = this.buildColumnDefinitions(groups);
//            console.log('columns', columnDefs);
            var table = tables.initTable('#table_q71_flora', {}, columnDefs);

//            console.log("fauna rows", rows);
            table.populate(rows);
        },

        buildColumnDefinitions: function (groups) {
            var result = [
                {
                    title: 'Region',
                    data: 'region'

                }
            ];
            var coloumnWith = '' + 80/groups.length.toFixed() + '%';

            var renderFunction = _.bind(this.renderAsList, this);
            _.each(groups, function (g) {
                result.push({
                    title: extractTaxonGroup(g),
                    data: g,
                    width: coloumnWith,
                    render: function (data) {
                        return renderFunction(data);
                    }
                });
            });
            return result;
        },

        renderAsList: function (values) {
            values = _.sortBy(values, function (v) {return -v.count});
            if (values.length === 0){
                return 'N/A';
            }
            // only the first 3
           values = _.slice(values,0,4);
            var compiled = _.template('<ul><% _.forEach(values, function(value) { %><li><%- value.pressure %> : <%- value.count %></li><% }); %></ul>');
            return compiled({ values: values });
        }


    });
});