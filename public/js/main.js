var EtsyAPIModule = (function () {

    // endpoint
    // https://openapi.etsy.com/v2/listings/active.js?callback=EtsyAPIModule.getData&&includes=Images:1&api_key=pwsh318hwrljh22zabbl3rtp
    // key:
    // pwsh318hwrljh22zabbl3rtp

    // set up vars
    var search = document.getElementById('search'),
        searchBtn = document.getElementById('search-btn'),
        bookmarkBtn = document.getElementById('bookmark-btn'),
        filterBarLinks = document.getElementById('navbar').getElementsByClassName('nav')[0].getElementsByTagName('a'),
        endPoint = 'https://openapi.etsy.com/v2/listings/active.js?callback=EtsyAPIModule.getData&&includes=Images:1&api_key=pwsh318hwrljh22zabbl3rtp',
        offset = 0,
        limit = 24,
        resultSet = '&limit=' + limit + '&offset=' + offset;

    // public get hash
    var getHashParams = function() {

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
    };

    // public delay method
    var delay = (function () {
        var timer = 0;
        return function (callback, ms) {
            clearTimeout(timer);
            timer = setTimeout(callback, ms);
        };
    })();

    var getScript = function(source, callback) {
        var apiScript = document.getElementById("apiScript");
        if( apiScript ) apiScript.parentNode.removeChild( apiScript );
        document.getElementById("list_loader").className = "glyphicon glyphicon-refresh icon-spin";
        document.getElementById("list_loader_overlay").className = "";
        var script = document.createElement('script');
        script.async = 1;
        script.id = 'apiScript';
        document.head.appendChild(script);

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
    };

    function getData(data) {
        //console.log(data);
        // set vars
        var imageDiv = document.getElementById("etsyImages"), html = '';
        // check that there is data
        if (data.count > 0) {
            // check if there is a result set then clear it
            if (imageDiv.innerHTML != '') imageDiv.innerHTML = '';
            html = "<div class='row'>";
            for (i = 0; i < data.results.length; i++) {
                if ((i % 4) === 0 && i !== 0) html = html + "</div><div class='row'>";
                html = html + "<div class='item col-md-3 grid-group-item'> \
                                <div class='thumbnail'> \
                                    <img src='" + data.results[i].Images[0].url_170x135 + "' class='group list-group-image' alt='product image'/> \
                                    <div class='caption'> \
                                            <p class='group inner list-group-item-text'>" + data.results[i].title + "</p> \
                                            <div class='row'> \
                                                <div class='col-sm-6'> \
                                                    <p class='lead'>$" + data.results[i].price + "</p> \
                                                </div> \
                                                <div class='col-sm-6'><a class='btn btn-success' href='" + data.results[i].url + "'>Details</a></div> \
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
    };

    var clearActive = function(pagLinks) {
        for (var i = 0; i < pagLinks.length; i++) {
            pagLinks[i].parentNode.className = '';
        }
    };

    var getSet = function(offset) {
        var page = offset / 24, set = 1;
        /*if
         1-10  = 1
         11-20 = 2
         21-30 = 3
         31-40 = 4
         41-50 = 5
         */
        for (var i = 1; i <= page; i++) {
            if (i % 10 === 0) set = set + 1;
            if (page === i) return set;
        }
    };

    function buildPagination(numPages, thisPage, set) {
        //sample html
        // <li><a href="#">1</a></li>
        //<li class="active"><a href="#">2</a></li>
        //<li><a href="#">3</a></li>
        var prevClass = (offset < '240') ? 'hidden' : '';
        // if the offset is the last set then hide the next button
        var nxtClass = (offset > ((numPages * 24) - 240 )) ? 'hidden' : '';
        // draw in the prev button
        var html = '<li><a href="" id="prev_set" data-set="' + set + '" class="' + prevClass + '">«</a></li>';
        for (var i = 1; i <= numPages; i++) {
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
        html = html + '<li><a href="#" id="next_set" data-set="' + set + '" class="' + nxtClass + '">»</a></li>';

        return html;
    };

    function prevNextHandler(element, pagLinks, numSet, pre_nxt) {
        var dataset = element.getAttribute("data-set"),
            endSet = (pre_nxt === 'prev')? (Number(dataset) - 1) * 10 : (Number(dataset) + 1) * 10,
            startSet = (pre_nxt === 'prev')? ((dataset - 2) * 10) + 1 : (dataset * 10) + 1,
            startPage = endSet - 9,
            startPageBtn = document.getElementById('pp' + startPage);
        startPageBtn.parentNode.className = "active";
        for (var i = 0; i < pagLinks.length; i++) {
            pagLinks[i].className = "";
            var prevNxt = pagLinks[i].id;
            if (i < startSet || i > endSet) {
                pagLinks[i].className = "hidden";
            }
            if (prevNxt === 'prev_set' || prevNxt === 'next_set') {
                pagLinks[i].className = "";
            }
        }

        var newDataSet = (pre_nxt === 'prev')? Number(dataset) - 1 : Number(dataset) + 1,
            startEnd = (pre_nxt === 'prev')? 1 : numSet;
        if (newDataSet === startEnd) element.className = 'visibility-none';
        document.getElementById('prev_set').setAttribute("data-set", newDataSet);
        document.getElementById('next_set').setAttribute("data-set", newDataSet);
        offset = startPageBtn.getAttribute('data-offset');
        resultSet = '&limit=' + limit + '&offset=' + offset;
        getScript(endPoint + resultSet + filterSet);
    };

    function setPagination(count, offset) {
        var numPages = Math.ceil(count / 24),
            numSet = Math.ceil(numPages/10),
            paginator = document.getElementById("paginator"),
            totalPages = document.getElementById("total_pages"),
            totalPagesTxt,
            thisPage = (offset < 1) ? 1 : offset / 24,
            set = (offset === '0') ? 1 : getSet(offset),
            pagLinks = document.getElementById('paginator').getElementsByTagName("a");
        if(pagLinks.length === 0) {
            var html = buildPagination(numPages, thisPage, set);
            paginator.innerHTML = html;
        }

        pagLinks = document.getElementById('paginator').getElementsByTagName("a");
        for (var i = 0; i < pagLinks.length; i++) {
            pagLinks[i].onclick = function (e) {
                e.preventDefault();
                if (this.id === 'prev_set') {
                    prevNextHandler(this, pagLinks, numSet, 'prev');
                    return;
                };
                if (this.id === 'next_set') {
                    prevNextHandler(this, pagLinks, numSet, 'nxt');
                    return;
                };
                offset = this.getAttribute("data-offset");
                resultSet = '&limit=' + limit + '&offset=' + offset;
                // clear current active
                clearActive(pagLinks);
                this.parentNode.className = 'active';
                // get the data
                getScript(endPoint + resultSet + filterSet);
            }
        }

        // populate total pages text left of pagination
        totalPagesTxt = 'Total Pages: ' + numPages;
        totalPages.innerHTML = totalPagesTxt;
    };

    // Check the query string for keywords
    var hasKeywords = getHashParams().keywords, filterSet = (hasKeywords) ? '&keywords=' + hasKeywords : '';
    // populate the search box with hash values
    document.getElementById('search').value = (hasKeywords) ? hasKeywords : '';

    // get the data for list
    getScript(endPoint + resultSet + filterSet);

    // set up event listeners
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
            searchTerm = (searchTerm === 'All')? '' : searchTerm;
            filterSet = (searchTerm) ? '&keywords=' + searchTerm : '';
            parent.location.hash = '#keywords=' + searchTerm;
            document.getElementById('search').value= searchTerm;
            getScript(endPoint + resultSet + filterSet);
            filterSet = '';
        };
    };

    return {
        //publicMethods
        getHashParams: getHashParams,
        delay: delay,
        getData: getData,
        // make public for testing
        getScript: getScript

    };

})();