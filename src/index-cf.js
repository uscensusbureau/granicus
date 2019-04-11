require('es6-promise').polyfill();
require('babel-polyfill');
const fetch = require('fetch-ie8')
// Create the connector object
let account = "11723";

import zip from "lodash.zip"
(function () {
  let myConnector = tableau.makeConnector();
  // var data_dump = [];
  
  // Custom initialization: https://tableau.github.io/webdataconnector/docs/wdc_custom_init_and_shutdown.html
  // myConnector.init = cb => {
  //
  //   if(tableau.phase == tableau.phaseEnum.gatherDataPhase) {
  //     // let dates = tableau.connectionData.split(';')[1];
  //     // let account = $('#accountID').val().trim();
  //     // let key = $('#apiKey').val().trim();
  //     let c_data = JSON.parse(tableau.connectionData);
  //     let key = c_data.key;
  //     let end = c_data.end_date;
  //
  //     // Latest date
  //     const end_date = new Date(end);
  //
  //     const month = end_date.getUTCMonth() + 1; //jan = 0
  //     const day = end_date.getUTCDate();
  //     const year = end_date.getUTCFullYear();
  //     const new_date = year + "-" + month + "-" + day;
  //     // Week ago date
  //     const wks_1 = new Date(new Date().setDate(end_date.getDate() - 7));
  //     const wks_1_month = wks_1.getUTCMonth() + 1;
  //     const wks_1_day = wks_1.getUTCDate();
  //     const wks_1_year = wks_1.getUTCFullYear();
  //     const wks_1_date = wks_1_year + "-" + wks_1_month + "-" + wks_1_day;
  //     // 2 Weeks ago date
  //     const wks_2 = new Date(new Date().setDate(end_date.getDate() - 14));
  //     const wks_2_month = wks_2.getUTCMonth() + 1;
  //     const wks_2_day = wks_2.getUTCDate();
  //     const wks_2_year = wks_2.getUTCFullYear();
  //     const wks_2_date = wks_2_year + "-" + wks_2_month + "-" + wks_2_day;
  //     // 3 weeks ago date
  //     const wks_3 = new Date(new Date().setDate(end_date.getDate() - 21));
  //     const wks_3_month = wks_3.getUTCMonth() + 1;
  //     const wks_3_day = wks_3.getUTCDate();
  //     const wks_3_year = wks_3.getUTCFullYear();
  //     const wks_3_date = wks_3_year + "-" + wks_3_month + "-" + wks_3_day;
  //
  //     // let allTimeStartDate = "2000-01-01";
  //
  //     let base_url = "https://cors-e.herokuapp.com/https://api.govdelivery.com/api/v2/accounts/" + account;
  //
  //     let bulletin_summary_1wk = base_url + `reports/bulletins/summary?start_date=${wks_1_date}&end_date=${new_date}`;
  //     let bulletin_summary_2wks = base_url + `reports/bulletins/summary?start_date=${wks_2_date}&end_date=${wks_1_date}`;
  //     let bulletin_summary_3wks = base_url + `reports/bulletins/summary?start_date=${wks_3_date}&end_date=${wks_2_date}`;
  //
  //     // let subcriber_summary_1wk = base_url + `reports/subscriber_activity/summary?start_date=${wks_1_date}&end_date=${new_date}`
  //     // let subcriber_summary_2wks = base_url + `reports/subscriber_activity/summary?start_date=${wks_2_date}&end_date=${new_date}`
  //
  //     let call_list = [
  //       bulletin_summary_1wk,
  //       bulletin_summary_2wks,
  //       bulletin_summary_3wks
  //     ];
  //
  //     const get_data = async calls => {
  //       const results = calls.map(async url => {
  //
  //         tableau.log("api call: " + url);
  //
  //         const response = await fetch(url, {
  //           method: "GET",
  //           headers: {
  //             'Content-Type': 'application/json',
  //             'Accept': 'application/hal+json',
  //             'X-AUTH-TOKEN': key
  //           }
  //         });
  //
  //         return response.json()
  //       });
  //
  //       const dump = await Promise.all(results);
  //       const keys_ = await Object.keys(dump[0]);
  //       const wk1_vals = await Object.values(dump[0]);
  //       const wk2_vals = await Object.values(dump[1]);
  //       const wk3_vals = await Object.values(dump[2]);
  //       return zip(keys_, wk1_vals, wk2_vals, wk3_vals);
  //     };
  //
  //     get_data(call_list).then(function (result) {
  //       tableau.log("data_dump: " + data_dump);
  //       console.log("data_dump: " + data_dump);
  //       data_dump = result
  //     }).then(cb())
  //
  //   }
  // };
    
  
  
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
  };
  
    // if (table.tableInfo.id == "counts") {
    //   table.appendRows(
    //     zipped.map( k => ({
    //         "name":  k[0],
    //         "this_wk": k[1],
    //         "prev_wk": k[2],
    //         "three_wk": k[3]
    //       })
    //     )
    //   );
    //   doneCallback()
    // }
  
  myConnector.getData = function (table, doneCallback) {
    let cd_data= JSON.parse(tableau.connectionData);

    let key = cd_data.key
    let end = cd_data.end_date
  
    // Latest date
    const end_date = new Date(end);
  
    const month = end_date.getUTCMonth() + 1; //jan = 0
    const day = end_date.getUTCDate();
    const year = end_date.getUTCFullYear();
    const new_date = year + "-" + month + "-" + day;
    // Week ago date
    const wks_1 = new Date(new Date().setDate(end_date.getDate() - 7));
    const wks_1_month = wks_1.getUTCMonth() + 1;
    const wks_1_day = wks_1.getUTCDate();
    const wks_1_year = wks_1.getUTCFullYear();
    const wks_1_date = wks_1_year + "-" + wks_1_month + "-" + wks_1_day;
    // 2 Weeks ago date
    const wks_2 = new Date(new Date().setDate(end_date.getDate() - 14));
    const wks_2_month = wks_2.getUTCMonth() + 1;
    const wks_2_day = wks_2.getUTCDate();
    const wks_2_year = wks_2.getUTCFullYear();
    const wks_2_date = wks_2_year + "-" + wks_2_month + "-" + wks_2_day;
    // 3 weeks ago date
    const wks_3 = new Date(new Date().setDate(end_date.getDate() - 21));
    const wks_3_month = wks_3.getUTCMonth() + 1;
    const wks_3_day = wks_3.getUTCDate();
    const wks_3_year = wks_3.getUTCFullYear();
    const wks_3_date = wks_3_year + "-" + wks_3_month + "-" + wks_3_day;
  
    // let allTimeStartDate = "2000-01-01";
  
    let base_url = "https://cors-e.herokuapp.com/https://api.govdelivery.com/api/v2/accounts/" + account;
  
    let bulletin_summary_1wk = base_url + `reports/bulletins/summary?start_date=${wks_1_date}&end_date=${new_date}`;
    let bulletin_summary_2wks = base_url + `reports/bulletins/summary?start_date=${wks_2_date}&end_date=${wks_1_date}`;
    let bulletin_summary_3wks = base_url + `reports/bulletins/summary?start_date=${wks_3_date}&end_date=${wks_2_date}`;
  
    // let subcriber_summary_1wk = base_url + `reports/subscriber_activity/summary?start_date=${wks_1_date}&end_date=${new_date}`
    // let subcriber_summary_2wks = base_url + `reports/subscriber_activity/summary?start_date=${wks_2_date}&end_date=${new_date}`
  
    let call_list = [
      bulletin_summary_1wk,
      bulletin_summary_2wks,
      bulletin_summary_3wks
    ];
  
    const get_data = async calls => {
      const results = calls.map(async url => {
      
        tableau.log("api call: " + url);
      
        const response = await fetch(url, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/hal+json',
            'X-AUTH-TOKEN': key
          }
        });
      
        return response.json()
      });
    
      const dump = await Promise.all(results);
      const keys_ = await Object.keys(dump[0]);
      const wk1_vals = await Object.values(dump[0]);
      const wk2_vals = await Object.values(dump[1]);
      const wk3_vals = await Object.values(dump[2]);
      return zip(keys_, wk1_vals, wk2_vals, wk3_vals);
    };
  
    get_data(call_list).then(function (result) {
      tableau.log("data_dump: " + result);
      console.log("data_dump: " + result);
      table.appendRows(
        result.map(k => ({
            "name": k[0],
            "this_wk": k[1],
            "prev_wk": k[2],
            "three_wk": k[3]
          })
        )
      );
      doneCallback()
    })
    
    
    
    
    
    
  };
    
    // if (table.tableInfo.id == "counts") {
    
    // }
  
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
        end_date: $('#end_date').val().trim()
      };
      
      tableau.connectionData = JSON.stringify(pass);
      tableau.connectionName = "Granicus WDC"; // This will be the data source name in Tableau
      tableau.submit()
    
      
      
      
      
      // tableau.connectionData = JSON.stringify(pass);
      
      
      // tableau.submit(); // This sends the connector object to Tableau
      
    })
  })
})();




