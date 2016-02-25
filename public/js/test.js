//EtsyAPIModule.getScript('https://openapi.etsy.com/v2/listings/active.js?callback=EtsyAPIModule.getData&&includes=Images:1&api_key=pwsh318hwrljh22zabbl3rtp', EtsyAPIModule.getData());
    module( "Elements Tests");

    // ensure all the required form elements are in place
    test( "All required elements exist", 7, function() {
        ok(document.getElementById("search").length != 0, "search input element exists");
        ok(document.getElementById("search-btn").length != 0, "search button element exists");
        //ok(document.getElementById("next_set").length != 0, "next_set pagination element exists");
        //ok(document.getElementById("prev_set").length != 0, "prev_set pagination element exists");
        //ok(document.getElementById("paginator").length != 0, "paginator element exists");
        ok(document.getElementById("bookmark-btn").length != 0, "bookmark button element exists");
        ok(document.getElementById("header_nav").length != 0, "header nav wrapper element exists");
        ok(document.getElementById("list_loader").length != 0, "header nav wrapper element exists");
        ok(document.getElementById("list_loader_overlay").length != 0, "header nav wrapper element exists");
        ok(document.getElementById("etsyImages").length != 0, "image wrapper element exists");
    });

    module( "Search Tests");

    // ensure the search box is populated from the nav links
    test( "check that when the links in the nav are clicked the search box is populated", function(assert) {
        // add listeners to nav links
        var filterBarLinks = document.getElementById('header_nav').getElementsByTagName('a');
        for (var x = 0; x < filterBarLinks.length; x++) {
            filterBarLinks[x].onclick = function (e) {
                e.preventDefault();
                searchTerm = this.innerHTML,
                searchTerm = (searchTerm === 'All') ? '' : searchTerm;
                document.getElementById('search').value = searchTerm;
            }
        }

        filterBarLinks[0].click();
        var searchBoxVal = document.getElementById('search').value;
        assert.strictEqual(searchBoxVal, searchTerm, "search box and link have the same value and type");

        filterBarLinks[1].click();
        var searchBoxVal = document.getElementById('search').value;
        assert.strictEqual(searchBoxVal, searchTerm, "search box and link have the same value and type");

        filterBarLinks[2].click();
        var searchBoxVal = document.getElementById('search').value;
        assert.strictEqual(searchBoxVal, searchTerm, "search box and link have the same value and type");

        filterBarLinks[3].click();
        var searchBoxVal = document.getElementById('search').value;
        assert.strictEqual(searchBoxVal, searchTerm, "search box and link have the same value and type");

        filterBarLinks[4].click();
        var searchBoxVal = document.getElementById('search').value;
        assert.strictEqual('', searchTerm, "search box and link have the same value and type");


});



