// endpoint
// https://openapi.etsy.com/v2/users/testusername.js?callback=handleStuff&api_key=pwsh318hwrljh22zabbl3rtp
// key:
// pwsh318hwrljh22zabbl3rtp

var endPoint = 'https://openapi.etsy.com/v2/listings/active.js?callback=getData&&includes=Images:1&api_key=pwsh318hwrljh22zabbl3rtp';


    function getHashParams() {

        var hashParams = {};
        var e,
            a = /\+/g,  // Regex for replacing addition symbol with a space
            r = /([^&;=]+)=?([^&;]*)/g,
            d = function (s) {
                return decodeURIComponent(s.replace(a, " "));
            },
            q = window.location.hash.substring(1);

        while (e = r.exec(q))
            hashParams[d(e[1])] = d(e[2]);

        return hashParams;
    }

    // Check the query string for keywords
    var hasKeywords = getHashParams().keywords,
    filterSet = (hasKeywords) ? '&keywords=' + hasKeywords : '';
    document.getElementById('search').value = (hasKeywords) ? hasKeywords : '';

    // Set limit and offset
    var offset = 0,
    limit = 24,
    resultSet = '&limit=' + limit + '&offset=' + offset;

    // get the data
    getScript(endPoint + resultSet + filterSet);


    function getScript(source, callback) {
        document.getElementById("list_loader").className = "glyphicon glyphicon-refresh icon-spin";
        document.getElementById("list_loader_overlay").className = "";
        var script = document.createElement('script');
        var prior = document.getElementsByTagName('script')[0];
        script.async = 1;
        prior.parentNode.insertBefore(script, prior);

        script.onload = script.onreadystatechange = function (_, isAbort) {
            if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {
                script.onload = script.onreadystatechange = null;
                script = undefined;
                if (!isAbort) {
                    if (callback) window[callback]();
                }
            }
        };

        script.src = source;
    }

    function getData(data) {
        // set vars
        var imageDiv = document.getElementById("etsyImages"), html = '';
        //console.log(data);
        // check that there is data
        if (data.count > 0) {
            // check if there is a result set then clear it
            if (imageDiv.innerHTML != '') imageDiv.innerHTML = '';
            html = "<div class='row'>";
            for (i = 0; i < data.results.length; i++) {
                if ((i % 4) === 0 && i !== 0) html = html + "</div><div class='row'>";
                html = html + "<div class='item col-lg-3 col-xs-3 grid-group-item'> \
                                <div class='thumbnail'> \
                                    <img src='" + data.results[i].Images[0].url_170x135 + "' class='group list-group-image' alt='product image'/> \
                                    <div class='caption'> \
                                            <p class='group inner list-group-item-text'>" + data.results[i].title + "</p> \
                                            <div class='row'> \
                                                <div class='col-xs-12 col-md-6'> \
                                                    <p class='lead'>$" + data.results[i].price + "</p> \
                                                </div> \
                                                <div class='col-xs-12 col-md-6'><a class='btn btn-success' href='" + data.results[i].url + "'>Details</a></div> \
                                            </div> \
                                    </div> \
                                </div> \
                            </div>";
            }
            html = html + '</div>';
            imageDiv.innerHTML = html;
            setPagination(data.count, data.params.offset);
        } else {
            // check if there is a result set and if so clear it
            if (imageDiv.innerHTML != '') imageDiv.innerHTML = '';
            html = '<p>No results.</p>';
            imageDiv.innerHTML = html;
        }

        document.getElementById("list_loader").className = "glyphicon glyphicon-refresh icon-spin fadeOut";
        setTimeout(function () {
            document.getElementById("list_loader").className = "hidden";
        }, 1000);
        document.getElementById("list_loader_overlay").className = "fadeOut";
        setTimeout(function () {
            document.getElementById("list_loader_overlay").className = "hidden";
        }, 1000);
    }

    function setPagination(count, offset) {
        var numPages = Math.ceil(count / 24),
            paginator = document.getElementById("paginator"),
            totalPages = document.getElementById("total_pages"),
            totalPagesTxt = '',
            html = '',
            i,
            c,
            thisPage = (offset < 1) ? 1 : offset / 24;

        function getSet() {
            var page = offset / 24, set = 1;
            /*if
             1-10  = 1
             11-20 = 2
             21-30 = 3
             31-40 = 4
             41-50 = 5
             */

            for (var c = 1; c <= page; c++) {
                if (c % 10 === 0) set = set + 1;
                if (page === c) return set;
            }
        }

        var set = (offset === '0') ? 1 : getSet();
        // if offset is less than 240 or the pagination is only the first ten pages
        // then hide the previous button otherwisse show it
        var prevClass = (offset < '240') ? 'hidden' : '';
        // if the offset is the last set then remove the next button
        var nxtClass = (offset > ((numPages * 24) - 240 )) ? 'hidden' : '';
        // draw in the prev button
        html = '<li><a href="" id="prev_set" data-set="' + set + '" class="' + prevClass + '">«</a></li>';
        for (i = 1; i <= numPages; i++) {
            var dataoffset = i * 24,
                setStart = (set * 10) - 9,
                setEnd = set * 10;

            if (i <= setEnd && i >= setStart) {
                var isActive = (i === thisPage || (i === 1 && thisPage < 1)) ? 'active' : '';
                html = html + "<li class='" + isActive + "'><a id='pp" + i + "' data-offset='" + dataoffset + "' href=''>" + i + "</a></li>";
            } else {
                html = html + "<li><a id='pp" + i + "' data-offset='" + dataoffset + "' href='' class='hidden'>" + i + "</a></li>";
            }
        }
        //draw in the next button
        html = ( numPages > 10 ) ? html + '<li><a href="#" id="next_set" data-set="' + set + '" class="' + nxtClass + '">»</a></li>' : html;

        //sample html
        // <li><a href="#">1</a></li>
        //<li class="active"><a href="#">2</a></li>
        //<li><a href="#">3</a></li>

        totalPagesTxt = 'Total Pages: ' + numPages;
        totalPages.innerHTML = totalPagesTxt;
        paginator.innerHTML = html;

        var pagLinks = document.getElementById('paginator').getElementsByTagName("a");
        for (var i = 0; i < pagLinks.length; i++) {
            pagLinks[i].onclick = function (e) {
                e.preventDefault();
                if (this.id === 'prev_set') {
                    var dataset = this.getAttribute("data-offset");
                    // TBD prev buttons not working no time
                    return;
                }
                ;
                if (this.id === 'next_set') {
                    var dataset = this.getAttribute("data-set"),
                        endSet = (Number(dataset) + 1) * 10,
                        startSet = (dataset * 10) + 1,
                        startPage = endSet - 9,
                        startPageBtn = document.getElementById('pp' + startPage);
                    startPageBtn.parentNode.className = "active";
                    for (var iter = 0; iter < pagLinks.length; iter++) {
                        pagLinks[iter].className = "";
                        var prevNxt = pagLinks[iter].id;
                        if (iter < startSet || iter > endSet) {
                            pagLinks[iter].className = "hidden";
                        }
                        if (prevNxt === 'prev_set' || prevNxt === 'next_set') {
                            pagLinks[iter].className = "";
                        }
                    }
                    var newDataSet = Number(dataset) + 1;
                    this.setAttribute("data-set", newDataSet);
                    document.getElementById('prev_set').setAttribute("data-set", newDataSet);
                    offset = startPageBtn.getAttribute('data-offset');
                    resultSet = '&limit=' + limit + '&offset=' + offset;
                    getScript(endPoint + resultSet + filterSet);
                    return;
                }
                ;
                offset = this.getAttribute("data-offset");
                resultSet = '&limit=' + limit + '&offset=' + offset;
                // get the data
                getScript(endPoint + resultSet + filterSet);
            }
        }
    }

    // reusable delay method
    var delay = (function () {
        var timer = 0;
        return function (callback, ms) {
            clearTimeout(timer);
            timer = setTimeout(callback, ms);
        };
    })();

    // event listeners
    var search = document.getElementById('search'),
    searchBtn = document.getElementById('search-btn'),
    bookmarkBtn = document.getElementById('bookmark-btn'),
    filterBarLinks = document.getElementById('header_nav').getElementsByTagName('a');

    search.onkeyup = function () {
        delay(function () {
            var searchTerm = document.getElementById('search').value;
            filterSet = (searchTerm) ? '&keywords=' + searchTerm : '';
            parent.location.hash = '#keywords=' + searchTerm;
            getScript(endPoint + resultSet + filterSet);
            filterSet = '';
        }, 1000);
    };

    searchBtn.onclick = function () {
        var searchTerm = document.getElementById('search').value;
        filterSet = (searchTerm) ? '&keywords=' + searchTerm : '';
        parent.location.hash = '#keywords=' + searchTerm;
        getScript(endPoint + resultSet + filterSet);
        filterSet = '';
    };

    bookmarkBtn.onclick = function () {
        // Mozilla Firefox Bookmark
        if ('sidebar' in window && 'addPanel' in window.sidebar) {
            window.sidebar.addPanel(location.href, document.title, "");
        } else if (/*@cc_on!@*/false) { // IE Favorite
            window.external.AddFavorite(location.href, document.title);
        } else { // webkit - safari/chrome
            alert('Press ' + (navigator.userAgent.toLowerCase().indexOf('mac') != -1 ? 'Command/Cmd' : 'CTRL') + ' + D to bookmark this page.');
        }
    };

    // add listeners to nav links
    for (var x = 0; x < filterBarLinks.length; x++) {
        filterBarLinks[x].onclick = function (e) {
            e.preventDefault();
            var searchTerm = this.innerHTML;
            filterSet = (searchTerm) ? '&keywords=' + searchTerm : '';
            parent.location.hash = '#keywords=' + searchTerm;
            document.getElementById('search').value= searchTerm;
            getScript(endPoint + resultSet + filterSet);
            filterSet = '';
        };
    }