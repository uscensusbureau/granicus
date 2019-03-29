(function() {
    // Create the connector object

	var myConnector = tableau.makeConnector();
	var dateObj = new Date();
	var month = dateObj.getUTCMonth() + 1; //jan = 0
	var day = dateObj.getUTCDate();
	var year = dateObj.getUTCFullYear();
	var newdate = year + "-" + month + "-" + day;
	var fortnightPrior = new Date(Date.now() - 12096e5);
	var fnPmonth = fortnightPrior.getUTCMonth() + 1;
	var fnPday = fortnightPrior.getUTCDate();
	var fnPyear = fortnightPrior.getUTCFullYear();
    var fnPnewdate = fnPyear + "-" + fnPmonth + "-" + fnPday;



    // Define the schema
    myConnector.getSchema = function(schemaCallback) {
        var cols = [{
            id: "total_subscribers",
            alias: "Total Subscribers",
            dataType: tableau.dataTypeEnum.int
		},
		{
            id: "deleted_subscribers",
            alias: "Deleted Subscribers",
            dataType: tableau.dataTypeEnum.int
		},
		{
            id: "direct_subscribers",
            alias: "Direct Subscribers",
            dataType: tableau.dataTypeEnum.int
		}];

        var schemas = {
        id: "subscribers",
        alias:
        "Subscribers: " +
        fnPnewdate +
        " - end: " +
        newdate,
        columns: cols
    };
    schemaCallback([schemas]);
    }
    
    myConnector.getData = function(table, doneCallback) {
    // var dates = tableau.connectionData.split(';')[1];
        var account = $('#accountID').val().trim();
        var key = $('#apiKey').val().trim();
        var apiCall =
        "https://cors-e.herokuapp.com/https://api.govdelivery.com/api/v2/accounts/"
        + account +
        "/reports/subscriber_activity/summary?start_date="
        + fnPnewdate +
        "&end_date="
        + newdate


        var req = new XMLHttpRequest()
        req.open("GET", apiCall, true)
        req.setRequestHeader('Content-Type', 'application/json')
        req.setRequestHeader('Accept', 'application/hal+json')
        req.setRequestHeader('X-AUTH-TOKEN', key)


        // tableau.log("dates: " + dates);
        tableau.log("api call: " + apiCall);
        
        
        req.onload = function() {
            var res = req.response
            var jn = JSON.parse(res)
            tableau.log("resp: " + jn);
            // FOR ARRAY:
            // table.appendRows(
            //     jn.map(function(result) {
            //         return {
            //             total_subscribers: result.total_subscribers,
            //             deleted_subscribers: result.deleted_subscribers,
            //             direct_subscribers: result.direct_subscribers
            //         };
            //     })
            // )
            // FOR OBJECT:
            table.appendRows(
                {
                    total_subscribers: jn.total_subscribers,
                    deleted_subscribers: jn.deleted_subscribers,
                    direct_subscribers: jn.direct_subscribers
                }
            )
            doneCallback()
        }
            
        req.send()
        // fetch(apiCall,
        //     {
        //         method: "GET",
        //         headers: myHeaders
        //     })
        //     .then(function(r) { 
        //         return r.json()
        //     })
        //     .then(function(j) { 
        //     tableau.log("resp: " + j);
        //     table.appendRows(
        //     j.map(function(result) {
        //         return {
        //             total_subscribers: result.total_subscribers,
        //             deleted_subscribers: result.deleted_subscribers,
        //             direct_subscribers: result.direct_subscribers
        //         };
        //     })
        //     )
        //     doneCallback();
        // })
    };

    tableau.registerConnector(myConnector);

    // Create event listeners for when the user submits the form
    $(document).ready(function() {
        $("#submitButton").click(function() {
            tableau.connectionName = "Granicus WDC"; // This will be the data source name in Tableau
            tableau.submit(); // This sends the connector object to Tableau
        });
    });
})();



 
