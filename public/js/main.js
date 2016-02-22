var endPoint = 'https://openapi.etsy.com/v2/listings/active.js?callback=getData&&includes=Images:1&api_key=pwsh318hwrljh22zabbl3rtp';

var queryString = function () {
    // This function is anonymous, is executed immediately and
    // the return value is assigned to QueryString!
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = decodeURIComponent(pair[1]);
            // If second entry with this name
        } else if (typeof query_string[pair[0]] === "string") {
            var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
            query_string[pair[0]] = arr;
            // If third or later entry with this name
        } else {
            query_string[pair[0]].push(decodeURIComponent(pair[1]));
        }
    }
    return query_string;
}();

// Check the query string for keywords
var hasKeywords = queryString.keywords;
var filterSet = (hasKeywords)? '&keywords=' + hasKeywords : '';
document.getElementById('search').value = (hasKeywords)? hasKeywords : "";
// check query string for limit and offset
var offset = 0;
var limit = 24;
var hasOffset = queryString.offset;
var hasLimit = queryString.limit;

var resultSet =  '&limit=' + limit + '&offset=' + offset;
if (hasOffset && hasLimit) {
    resultSet = '&limit=' + hasLimit + '&offset=' + hasOffset;
} else if (hasOffset) {
    resultSet = '&limit=' + limit + '&offset=' + hasOffset;
} else if (hasLimit) {
    resultSet = '&limit=' + hasLimit + '&offset=' + offset;
}
// get the data
getScript(endPoint + resultSet + filterSet);


function getScript(source, callback) {
    var script = document.createElement('script');
    var prior = document.getElementsByTagName('script')[0];
    script.async = 1;
    prior.parentNode.insertBefore(script, prior);

    script.onload = script.onreadystatechange = function( _, isAbort ) {
        if(isAbort || !script.readyState || /loaded|complete/.test(script.readyState) ) {
            script.onload = script.onreadystatechange = null;
            script = undefined;
            if(!isAbort) { if(callback) window[callback](); }
        }
    };

    script.src = source;
}

function getData(data) {
    // set vars
    var imageDiv = document.getElementById("etsyImages"), html = '';
    console.log(data);
    // check that there is data
    if (data.count > 0) {
        // check if there is a result set then clear it
        if (imageDiv.innerHTML != '') imageDiv.innerHTML = '';
        // if there are results in the data
        html = "<div class='row'>";
        for ( i=0; i < data.results.length; i++ ) {
            //console.log(data.results[i]);
            if((i !== 0 && i % 4) === 0) html = html + '</div><div class="row">', console.log(i + ' is it 0 or divisible by 4?');
            html = html + "<div class='col-md-3'><a class='item-wrap' href='" + data.results[i].url + "'><img src='" + data.results[i].Images[0].url_170x135 + "' /></a><div class='item-title'>" + data.results[i].title + "</div></div>";
        }
        html = html + '</div>'
        imageDiv.innerHTML = html;
    } else {
        // check if there is a result set and if so clear it
        if (imageDiv.innerHTML != '') imageDiv.innerHTML = '';
        html = '<p>No results.</p>';
        imageDiv.innerHTML = html;
    }
}


var searchBtn = document.getElementById('search-btn');
var bookmarkBtn = document.getElementById('bookmark-btn');

searchBtn.onclick = function(e) {
    searchTerm = document.getElementById('search').value;
    filterSet = (searchTerm)? '&keywords=' + searchTerm : '';
    getScript(endPoint + resultSet + filterSet);
    filterSet = '';
};

bookmarkBtn.onclick = function() {
    // Mozilla Firefox Bookmark
    if ('sidebar' in window && 'addPanel' in window.sidebar) {
        window.sidebar.addPanel(location.href,document.title,"");
    } else if( /*@cc_on!@*/false) { // IE Favorite
        window.external.AddFavorite(location.href,document.title);
    } else { // webkit - safari/chrome
        alert('Press ' + (navigator.userAgent.toLowerCase().indexOf('mac') != - 1 ? 'Command/Cmd' : 'CTRL') + ' + D to bookmark this page.');
    }
};

//https://openapi.etsy.com/v2/users/testusername.js?callback=handleStuff&api_key=pwsh318hwrljh22zabbl3rtp
// pwsh318hwrljh22zabbl3rtp