define([
    'jquery',
    'underscore',
    'backbone',
    'views/region/communitiesSummaryView',
    'text!templates/assets/assetsSummaryTemplate.html'
], function ($, _, Backbone, RegionCommunityView, summaryTemplate) {

    /* Very similar to the one in region
     */
    return RegionCommunityView.extend({
        el: '#result_content',

        columnDefinitions: [
            {
                title: 'Subregion',
                width: '10vw',
                data: 'id',
                render: function (data) {
                    return data.rendered
                }
            },
            {
                title: 'Community Name',
                width: '40vw',
                data: 'name',
                render: function (data) {
                    return data.rendered
                }
            },
            {
                title: 'Threats',
                width: '12.5vw',
                data: 'threats',
                render: function (data) {
                    return data.rendered
                }
            },
            {
                title: 'Status WA',
                width: '12.5vw',
                data: 'status',
                render: function (data) {
                    return data.rendered
                }
            },
            {
                title: 'Trends',
                data: 'trends',
                width: '12.5vw',
                render: function (data) {
                    return data.rendered
                }
            },
            {
                title: 'Management Requirement',
                width: '12.5vw',
                data: 'management',
                render: function (data) {
                    return data.rendered
                }
            }
        ],

        initialize: function (options) {
            this.label = options.label || "";
        },

        buildSummaryContent: function () {
            var values = {label: this.label || ""};
            return _.template(summaryTemplate)(values);
        }


    });

});