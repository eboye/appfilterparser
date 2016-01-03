/*global $, console */
/*!
 * AppFilter Parser v0.9.0 (http://srbodroid.com/longshadow/parser/)
 * Copyright 2011-2014 SrboDroid
 * Licensed under GNU/GPL (http://www.gnu.org/licenses/gpl.html)
 */

/* Global variables definition */

var imageholder = $('.imageholder'),
    progressbar = $('.progress .progress-bar'),
    originalAppfilter = $('#originalAppfilter');

/* Global Ajax Function */

$.extend({

    getValues: function (url) {
        'use strict';
        var result = null;
        $.ajax({
            url: url,
            type: 'get',
            dataType: 'json',
            async: false,
            success: function (data) {
                result = data;
            }
        });
        return result;
    }

});

/* Function for getting images that is triggered after parser finishes */

function populateImages() {
    'use strict';
    /* We are getting the app activity from data attribute and request image from API */

    var total = imageholder.length,
        current = 0;

    progressbar.text('Loading images ' + current + ' of ' + total)
        .attr('aria-valuenow', current)
        .attr('aria-valuemax', total);

    $('.loading').removeClass('hide');

    imageholder.each(function () {

        current = parseInt(progressbar.attr('aria-valuenow'), 10) + 1;
        total = progressbar.attr('aria-valuemax');

        if (total === current) {

            progressbar.text('Finished loading all the icons!');
            $('.loading').delay(5000).addClass('hide');

        } else {

            progressbar.text('Loading icons ' + current + ' of ' + total);

        }

        progressbar.attr('aria-valuenow', current).width(current / total * 100 + '%');

        var appActivity = $(this).attr('data-activity'),
            logolink = 'http://playstore-api.herokuapp.com/playstore/apps/' + appActivity,
            image = '';
        if ($.getValues(logolink).logo) {
            image = '<img class="media-object pull-left" alt="32x32" style="width:32px;height:32px" src="' +
                $.getValues(logolink).logo +
                '"/>';
        } else {
            image = '<img class="media-object pull-left" alt="32x32" style="width:32px;height:32px" src="img/na.png"/>';
        }

        $(this).html(image);

    });
}

/* Parse the original appfilter.xml */

function orgInputFilter() {
    'use strict';
    /* Variables used for XML document validation */

    var searchXMLheader = '<?xml',
        searchResources = '<resources>',
        parsedxml,
        xml,
        i,
        j,
        numberOf,
        appID,
        appActivity,

    /* Get value from textarea */

        xml_data = originalAppfilter.val();

    /* Check if the textarea input field has something and through an alert if it's empty */

    if (xml_data === '') {

        $('body').append('<div id="alert-empty1" class="alert alert-danger alert-dismissable fade in" aria-hidden="true"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><strong>Error!</strong> You haven\'t entered your appfilter.</div>');

    } else {

        /* Disable The Original AppFilter TextArea */

        originalAppfilter.attr('disabled', true);

        /* Check if this is valid XML document and add proper values if it's not */

        if (xml_data.search(searchResources) === -1) {
            xml_data = '<resources>' + xml_data + '</resources>';
        }

        if (xml_data.search(searchXMLheader) === -1) {
            xml_data = '<?xml version="1.0" encoding="utf-8"?>' + xml_data;
        }

        //xml_data = xml_data.replace(<iconupon([^'"]|"[^"]*"|'[^']*')*, '');

        /* Convert the data to XML Document */

        parsedxml = $.parseXML(xml_data);

        /* Convert XML Document to JSON */

        xml = $.xml2json(parsedxml);

        /* Now populate the table with results */

        for (i = 0, j = xml.item.length; i < j; i++) {

            numberOf = i + 1 + '/' + j;

            appID = xml.item[i].component.split('/', 2);
            appActivity = appID[0].replace('ComponentInfo{', '');

            $('.original_results').append('<tr class="item"><td><h4 class="media-heading">' + xml.item[i].drawable + '<span class="badge pull-right">' + numberOf + '</span></h4></td><td><div class="imageholder" data-activity="' + appActivity + '"></div></td><td class="component">' + xml.item[i].component + '</td></tr>');
        }

    }

}

/* Parse the requested appfilter.xml */

function newInputFilter() {
    'use strict';
    /* Variables used for XML document validation */
    var searchXMLheader = '<?xml',
        searchResources = '<resources>',
        parsedxml,
        xml,
        i,
        j,
        numberOf,
        appID,
        appActivity,
        logolink,
        appName,
        componentContains,

    /* Get value from textarea */

        xml_data = $('#newAppfilter').val();

    /* Check if the textarea input field has something and through an alert if it's empty */

    if (xml_data === '') {
        $('body').append('<div id="alert-empty2" class="alert alert-danger alert-dismissable fade in" aria-hidden="true"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><strong>Error!</strong> You haven\'t entered requested appfilter.</div>');
    } else {

        /* Unhide the results table with tabs */

        $('.rezultat').removeClass('hide');

        /* Check if this is valid XML document and add proper values if it's not */

        if (xml_data.search(searchResources) === -1) {
            xml_data = '<resources>' + xml_data + '</resources>';
        }

        if (xml_data.search(searchXMLheader) === -1) {
            xml_data = '<?xml version="1.0" encoding="utf-8"?>' + xml_data;
        }

        // Remove all dolar signs from xml

        xml_data = xml_data.replace(/&/mgi, '');

        /* Convert the data to XML Document */

        parsedxml = $.parseXML(xml_data);

        /* Convert XML Document to JSON */

        xml = $.xml2json(parsedxml);

        /* Now populate the table with results */

        for (i = 0, j = xml.item.length; i < j; i++) {

            /* Index badge */

            numberOf = i + 1 + '/' + j;

            /* Get only the AppID from activity */

            appID = xml.item[i].component.split('/', 2);
            appActivity = appID[0].replace('ComponentInfo{', '');

            /* Make an API link */

            logolink = 'http://playstore-api.herokuapp.com/playstore/apps/' + appActivity;

            /* If the app is available on playstore get it's name, if there is not, use drawable name */
            if ($.getValues(logolink) !== null) {
                if ($.getValues(logolink).appName) {
                    appName = '<span class="appname">' + $.getValues(logolink).appName.replace(' - Android Apps on Google Play', '') + '</span>';
                } else {
                    appName = '<span class="appname">' + xml.item[i].drawable + '</span>';
                }
            } else {
                appName = '<span class="appname">' + xml.item[i].drawable + '</span>';
            }

            /* Now the main part! Check if requested activity is already defined, mark original in red as well as new one and populate tables  */
            componentContains = $('.original_results .component:contains("' + xml.item[i].component + '")');

            if (componentContains.length !== 0) {

                componentContains.parent().addClass('danger');
                $('.parser_results').prepend('<tr class="item danger"><td><h4 data-id="' + appActivity + '" class="media-heading">' + appName + '<span class="badge pull-right">' + numberOf + '</span></h4></td><td><div class="imageholder" data-activity="' + appActivity + '"></div></td><td class="component">' + xml.item[i].component + '</td></tr>');

            } else {

                $('.parser_results').prepend('<tr class="item"><td><h4 data-id="' + appActivity + '" class="media-heading">' + appName + '<span class="badge pull-right">' + numberOf + '</span></h4></td><td><div class="imageholder" data-activity="' + appActivity + '"></div></td><td class="component">' + xml.item[i].component + '</td></tr>');

            }

            $('.requested_results').prepend('<tr class="item"><td><h4 data-id="' + appActivity + '" class="media-heading">' + appName + '<span class="badge pull-right">' + numberOf + '</span></h4></td><td><div class="imageholder" data-activity="' + appActivity + '"></div></td><td class="component">' + xml.item[i].component + '</td></tr>');

        }

    }

}

/* Fire up everything! :) */

$('.begin_parse').on('click', function (e) {
    'use strict';
    e.preventDefault();
    $.when(orgInputFilter()).done(function () {
        newInputFilter();
    });
    populateImages();
});

/* Fire up without icons */

$('.begin_parse_without_icons').on('click', function (e) {
    'use strict';
    e.preventDefault();
    $.when(orgInputFilter()).done(function () {
        newInputFilter();
    });
    $('.imageholder').html('<img class="media-object pull-left get_image" alt="32x32" style="width:32px;height:32px" src="img/na.png"/>');
});

/* Modal with app details */

$('body').on('click', 'table h4', function () {
    'use strict';
    var appTitle = $(this).find('.appname').text(),
        thisID = $(this).attr('data-id'),
        appID = 'http://playstore-api.herokuapp.com/playstore/apps/' + thisID,
        psURL = 'https://play.google.com/store/apps/details?id=' + thisID,

        logoImage = $(this).parent().parent().find('img').attr('src'),
        appDev = $.getValues(appID) !== null ? $.getValues(appID).developer : '',
        appUrl = $.getValues(appID) !== null ? $.getValues(appID).playStoreUrl : psURL,
        appdesc = $.getValues(appID) !== null ? $.getValues(appID).description : '',
        appScore = $.getValues(appID) !== null ? $.getValues(appID).score : '',
        appComponent = $(this).parent().parent().find('.component').text(),

        drawable = $(this).attr('data-id').replace(/\./mgi, '_').toLowerCase(),
        appfilterxml = '&lt;item component="ComponentInfo{' + appComponent + '}" drawable="' + drawable + '" /&gt;',
        drawablexml = '&lt;item drawable="' + drawable + '" /&gt;',
        iconpackxml = '&lt;item&gt;' + drawable + '&lt;/item&gt;',
        desccontent,
        appdescEl = $('#appdesc');

    if (logoImage === 'img/na.png') {
        logoImage = $.getValues(appID) ? $.getValues(appID).logo : 'img/na.png';
    }

    desccontent = '<h6><strong>App Activity:</strong></h6><h6><pre>' +
        appComponent +
        '</pre></h6><h6><pre>' +
        appfilterxml +
        '</pre></h6><h6><pre>' +
        drawablexml +
        '</pre></h6><h6><pre>' +
        iconpackxml +
        '</pre></h6><a href="' +
        appUrl +
        '" target="_blank" title="Click to open image in new tab"><img class="media-object pull-left" src="' +
        logoImage +
        '"/></a><h4><strong>Developed by:</strong> ' +
        appDev +
        '</h4><h5><strong>Rating:</strong> ' +
        appScore +
        '</h5>' +
        appdesc;

    appdescEl.find('.modal-title').text(appTitle);

    appdescEl.find('.modal-body').html(desccontent);

    appdescEl.find('.playstore')
        .html('<a href="' +
            appUrl +
            '" title="' +
            appTitle +
            '" target="_blank"><img src="img/playstore.png" alt="Play Store"/></a>');

    appdescEl.modal({
        keyboard: true
    });
});

/* Tabs functionality */

$('#tabs').find('a').click(function (e) {
    'use strict';
    e.preventDefault();
    $(this).tab('show');
});

/* Clear fields button */

$('.clear_fields').click(function (e) {
    'use strict';
    e.preventDefault();
    originalAppfilter.attr('disabled', false).val('');
    $('#newAppfilter').attr('disabled', false).val('');
    $('.parser_results').html('');
    $('.requested_results').html('');
    $('.original_results').html('');
});

/* Hide Duplicates */

$('.hide_duplicates').on('click', function () {
    'use strict';
    if ($(this).hasClass('hide_dup')) {
        $(this).parent().parent().find('.danger').removeClass('hide');
        $(this).removeClass('hide_dup').html('<span class="glyphicon glyphicon-eye-close"></span>&#32;Hide duplicates');
    } else {
        $(this).parent().parent().find('.danger').addClass('hide');
        $(this).addClass('hide_dup').html('<span class="glyphicon glyphicon-eye-open"></span>&#32;Show duplicates');
    }

});

/* PayPal Hover */

$('.paypal .ppbtn').hover(
    function () {
        'use strict';
        $(this).attr('src', 'img/donate_button_hover.png');
    },
    function () {
        'use strict';
        $(this).attr('src', 'img/donate_button.png');
    }
);