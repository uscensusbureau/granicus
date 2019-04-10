import _ from "lodash"

(function () {
  // Create the connector object
  let account = "11723"
  let myConnector = tableau.makeConnector();
  
  // Define the schema
  myConnector.getSchema = function (schemaCallback) {

    // Rates are float types, so breaking out into separate tables
    // let rate_schema = [{
    //   id: "name",
    //   alias: "Name of Metric",
    //   dataType: tableau.dataTypeEnum.float
    // },
    // {
    //   id: "prev_wk",
    //   alias: "Previous Week",
    //   dataType: tableau.dataTypeEnum.float
    // },
    // {
    //   id: "this_wk",
    //   alias: "This Week",
    //   dataType: tableau.dataTypeEnum.float
    // },
    // {
    //   id: "delta_1",
    //   alias: "Delta One Week",
    //   dataType: tableau.dataTypeEnum.float
    // },
    // {
    //   id: "delta_2",
    //   alias: "Delta Two Weeks",
    //   dataType: tableau.dataTypeEnum.float
    // }]

    // let rates = {
    //   id: "rates",
    //   alias: "Rates",
    //   columns: rate_schema
    // };
    
    // Counts are integers, a separate table
    let count_schema = [{
      id: "name",
      alias: "Name of Metric",
      dataType: tableau.dataTypeEnum.int
    },
    {
      id: "this_wk",
      alias: "This Week",
      dataType: tableau.dataTypeEnum.int
    },
    {
      id: "prev_wk",
      alias: "Previous Week",
      dataType: tableau.dataTypeEnum.int
    },
    {
      id: "three_wk",
      alias: "Three Weeks Ago",
      dataType: tableau.dataTypeEnum.int
    },
    
 ];

    let counts = {
      id: "counts",
      alias: "Counts",
      columns: count_schema
    };

    schemaCallback([counts]);
  }

  myConnector.getData = function (table, doneCallback) {
    // let dates = tableau.connectionData.split(';')[1];
    // let account = $('#accountID').val().trim();
    // let key = $('#apiKey').val().trim();
    let data = JSON.parse(tableau.connectionData)
    let key = data.key

    // Latest date
    let end_date = new Date(data.end_date)
    let month = end_date.getUTCMonth() + 1; //jan = 0
    let day = end_date.getUTCDate();
    let year = end_date.getUTCFullYear();
    let new_date = year + "-" + month + "-" + day;

    // Week ago date
    let wks_1 = new Date().setDate(end_date.getDate() - 7);
    let wks_1_month = wks_1.getUTCMonth() + 1;
    let wks_1_day = wks_1.getUTCDate();
    let wks_1_year = wks_1.getUTCFullYear();
    let wks_1_date = wks_1_year + "-" + wks_1_month + "-" + wks_1_day;

    // 2 Weeks ago date
    let wks_2 = new Date().setDate(end_date.getDate() - 14);
    let wks_2_month = wks_2.getUTCMonth() + 1;
    let wks_2_day = wks_2.getUTCDate();
    let wks_2_year = wks_2.getUTCFullYear();
    let wks_2_date = wks_2_year + "-" + wks_2_month + "-" + wks_2_day;

    // 3 weeks ago date
    let wks_3 = new Date().setDate(end_date.getDate() - 21);
    let wks_3_month = wks_3.getUTCMonth() + 1;
    let wks_3_day = wks_3.getUTCDate();
    let wks_3_year = wks_3.getUTCFullYear();
    let wks_3_date = wks_3_year + "-" + wks_3_month + "-" + wks_3_day;

    // month ago date
    let monthAgo = new Date().setDate(end_date.getDate() - 30)
    let monthAgoM = monthAgo.getUTCMonth() + 1;
    let monthAgoD = monthAgo.getUTCDate();
    let monthAgoY = monthAgo.getUTCFullYear();
    let monthAgoDate = monthAgoY + "-" + monthAgoM + "-" + monthAgoD 

    let allTimeStartDate = "2000-01-01"

    let base_url = "https://cors-e.herokuapp.com/https://api.govdelivery.com/api/v2/accounts/" + account 

    let bulletin_summary_1wk = base_url + `reports/bulletins/summary?start_date=${wks_1_date}&end_date=${new_date}` 
    let bulletin_summary_2wks = base_url + `reports/bulletins/summary?start_date=${wks_2_date}&end_date=${wks_1_date}` 
    let bulletin_summary_3wks = base_url + `reports/bulletins/summary?start_date=${wks_3_date}&end_date=${wks_2_date}` 

    // let subcriber_summary_1wk = base_url + `reports/subscriber_activity/summary?start_date=${wks_1_date}&end_date=${new_date}`
    // let subcriber_summary_2wks = base_url + `reports/subscriber_activity/summary?start_date=${wks_2_date}&end_date=${new_date}`

    let call_list = [
      bulletin_summary_1wk,
      bulletin_summary_2wks,
      bulletin_summary_3wks
    ]

    async function get_data (calls) {
      const results = calls.map(async url => {

        tableau.log("api call: " + url);

        const response = await fetch(url, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/hal+json',
            'X-AUTH-TOKEN': key
          }
        })

        return response.json()
      })

      const dump = await Promise.all(results)
      const keys_ = await Object.keys(dump[0])
      const wk1_vals = await Object.values(dump[0])
      const wk2_vals = await Object.values(dump[1])
      const wk3_vals = await Object.values(dump[2])
      const zipped = await _.zip(keys_, wk1_vals, wk2_vals, wk3_vals)

      
      if (table.tableInfo.id == "counts") {
        table.appendRows(
          zipped.map( k => ({
              "name":  k[0],
              "this_wk": k[1],
              "prev_wk": k[2], 
              "three_wk": k[3] 
            })
          )
        )
        doneCallback()
      }

      // if (table.tableInfo.id == "counts") {
        
      // }

    }

  //   req.onload = function () {
  //     let res = req.response
  //     let jn = JSON.parse(res)
  //     tableau.log("resp: " + jn);
  //     // FOR ARRAY:
  //     // table.appendRows(
  //     //     jn.map(function(result) {
  //     //         return {
  //     //             "total_subscribers" : result.total_subscribers,
  //     //             "deleted_subscribers" : result.deleted_subscribers,
  //     //             "direct_subscribers" : result.direct_subscribers
  //     //         };
  //     //     })
  //     // )
  //     // FOR OBJECT:
  //     table.appendRows(
  //       [{
  //         "total_subscribers": jn.total_subscribers,
  //         "deleted_subscribers": jn.deleted_subscribers,
  //         "direct_subscribers": jn.direct_subscribers
  //       }]
  //     )
  //     doneCallback()
  //   }

  //   req.send()
  //   // fetch(apiCall,
  //   //     {
  //   //         method: "GET",
  //   //         headers: myHeaders
  //   //     })
  //   //     .then(function(r) { 
  //   //         return r.json()
  //   //     })
  //   //     .then(function(j) { 
  //   //     tableau.log("resp: " + j);
  //   //     table.appendRows(
  //   //     j.map(function(result) {
  //   //         return {
  //   //             "total_subscribers" : result.total_subscribers,
  //   //             "deleted_subscribers" : result.deleted_subscribers,
  //   //             "direct_subscribers" : result.direct_subscribers
  //   //         };
  //   //     })
  //   //     )
  //   //     doneCallback();
  //   // })
  // };

    tableau.registerConnector(myConnector);

    // Create event listeners for when the user submits the form
    $(document).ready(function () {
      $("#submitButton").click(function () {

        let pass = {
          key: $('#apiKey').val().trim(),
          end_date:  $('#end_date').val().trim(),
        }

        tableau.connectionData = JSON.stringify(pass)
        
        tableau.connectionName = "Granicus WDC"; // This will be the data source name in Tableau
        
        tableau.submit(); // This sends the connector object to Tableau
      
      });
    });
  }
})();




