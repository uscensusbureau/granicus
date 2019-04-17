// require('es6-promise').polyfill();

/*
Tableau's internal browser is old. In order to make dealing with multiple
asynchronous API calls, waiting for them and processing them *in order*, we use
a combination of browserify (with babelify) and some polyfills

Using the CLI:

browserify ./src/index.js -o bundle.js -t [ babelify --presets [ @babel/preset-env ] ]

 */

// Polyfills
require('babel-polyfill');
// special polyfill for fetch support (not provided by babel-polyfill)
require('fetch-ie8')

// function from lodash for allowing us to combine multiple API responses into a
// single 'table'
import zip from "lodash.zip"

(function () {
// Create the connector object
  let myConnector = tableau.makeConnector();
 
  
  // Define the schema
  myConnector.getSchema = function (schemaCallback) {
    let rates_schema = [
      {
        id: "name",
        alias: "Name of Metric",
        dataType: tableau.dataTypeEnum.string
      },
      {
        id: "this_wk",
        alias: "This Week",
        dataType: tableau.dataTypeEnum.float
      },
      {
        id: "prev_wk",
        alias: "Previous Week",
        dataType: tableau.dataTypeEnum.float
      },
      {
        id: "three_wk",
        alias: "Three Weeks Ago",
        dataType: tableau.dataTypeEnum.float
      },
    ];
    
    let summary_schema = [
      {
        id: "name",
        alias: "Name of Metric",
        dataType: tableau.dataTypeEnum.string
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
  
    let summary_schema2 = [
      {
        id: "name",
        alias: "Name of Metric",
        dataType: tableau.dataTypeEnum.string
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
  
    let bulletin_rates = {
      id: "bulletin_rates",
      alias: "Bulletins Table",
      columns: rates_schema
    };
    
    let bulletins = {
      id: "bulletins",
      alias: "Bulletins Table",
      columns: summary_schema
    };
  
    let subscribers = {
      id: "subscribers",
      alias: "Subscribers Table",
      columns: summary_schema2
    };
    
    schemaCallback([bulletins, subscribers]);
  };
  

  
  myConnector.getData = function (table, doneCallback) {
    // account number
    let account = "11723";
    
    // parse the string passed between Tableau lifecycle phases to get the user
    // supplied data into our calls
    let cd_data= JSON.parse(tableau.connectionData);
    let key = cd_data.key
    let end = cd_data.end_date
    
    
  
    // Latest date from user input
    const end_date = new Date(end);
    
    // function for creating dates formatted for Granicus API
    const makeDate = (days_ago) => {
      // create date from number of 'days_ago' from
      const date = new Date(new Date().setDate(end_date.getDate() - days_ago));
      const month = date.getUTCMonth() + 1; //jan = 0
      const day = date.getUTCDate();
      const year = date.getUTCFullYear();
      return `${year}-${month}-${day}`
    }
    
    const new_date = makeDate(0)
    const wks_1_date = makeDate(7)
    const wks_2_date = makeDate(14)
    const wks_3_date = makeDate(21)
 
  
    // let allTimeStartDate = "2000-01-01";
    
    let base_url = "https://cors-e.herokuapp.com/https://api.govdelivery.com/api/v2/accounts/" + account + "/";
    
    // Bulletins summary url:
    let BSURL = "reports/bulletins/summary"
    // Subscriber summary url:
    let SSURL = "reports/subscriber_activity/summary"
    
    let makeURL = (extURL, startDate, endDate) => `${base_url}${extURL}?start_date=${startDate}&end_date=${endDate}`
  
    let bulletin_summary_1wk = makeURL(BSURL, wks_1_date, new_date)
    let bulletin_summary_2wks = makeURL(BSURL, wks_2_date, wks_1_date)
    let bulletin_summary_3wks = makeURL(BSURL, wks_3_date, wks_2_date)
  
    let subscriber_summary_1wk = makeURL(SSURL, wks_1_date, new_date)
    let subscriber_summary_2wks = makeURL(SSURL, wks_2_date, wks_1_date)
    let subscriber_summary_3wks = makeURL(SSURL, wks_3_date, wks_2_date)
    
    let callList1 = [
      bulletin_summary_1wk,
      bulletin_summary_2wks,
      bulletin_summary_3wks
    ];
  
    let callList2 = [
      subscriber_summary_1wk,
      subscriber_summary_2wks,
      subscriber_summary_3wks
    ];
    
  
    const get_data = async calls => {
      const results = calls.map(async url => {
      
        tableau.log("api call: " + url);
  
        // const response = await window.fetch(url, {
        const response = await window.fetch(url, {
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
      
      // control logic for derived/calculated fields
      if (table.tableInfo.id === "bulletin_rates") {
        let keys_ = []
        let wk1_vals = []
        let wk2_vals = []
        let wk3_vals = []
        
        keys_.push("open_rate")
        wk1_vals.push(dump[0]["opens_count"] / dump[0]["total_delivered"])
        wk2_vals.push(dump[1]["opens_count"] / dump[1]["total_delivered"])
        wk3_vals.push(dump[2]["opens_count"] / dump[2]["total_delivered"])
        return zip(keys_, wk1_vals, wk2_vals, wk3_vals);
        
      } else {
        const keys_ = await Object.keys(dump[0]);
        const wk1_vals = await Object.values(dump[0]);
        const wk2_vals = await Object.values(dump[1]);
        const wk3_vals = await Object.values(dump[2]);
        
        return zip(keys_, wk1_vals, wk2_vals, wk3_vals);
      }
      
    };
  
    if (table.tableInfo.id === "bulletins") {
      get_data(callList1)
      .then( result => {
        // tableau.log("data_dump: " + result);
        // console.log("data_dump: " + result);
        table.appendRows(
          result.map(k => ({
              "name": k[0],
              "this_wk": k[1],
              "prev_wk": k[2],
              "three_wk": k[3]
            })
          )
        )
        doneCallback()
      })
    }
  
    if (table.tableInfo.id === "bulletin_rates") {
      get_data(callList1)
        .then( result => {
          // tableau.log("data_dump: " + result);
          // console.log("data_dump: " + result);
          table.appendRows(
            result.map(k => ({
                "name": k[0],
                "this_wk": k[1],
                "prev_wk": k[2],
                "three_wk": k[3]
              })
            )
          )
          doneCallback()
        })
    }
    
    if (table.tableInfo.id === "subscribers") {
      get_data(callList2)
      .then( result => {
        // tableau.log("data_dump: " + result);
        // console.log("data_dump: " + result);
        table.appendRows(
          result.map(k => ({
              "name": k[0],
              "this_wk": k[1],
              "prev_wk": k[2],
              "three_wk": k[3]
            })
          )
        )
        doneCallback()
      })
    }
    
    
  }


  tableau.registerConnector(myConnector);
  
  // Create event listeners for when the user submits the form
  $(document).ready(function () {
    $("#submitButton").click(function () {
      
      // Get user input and store it in an object
      let pass = {
        key: $('#apiKey').val().trim(),
        end_date: $('#end_date').val().trim()
      };
      
      // Tableau requires that `connectionData` be a string
      tableau.connectionData = JSON.stringify(pass);
      
      // This will be the data source name in Tableau
      tableau.connectionName = "Granicus WDC";
      
      // Completes the 'interactive phase'
      tableau.submit()
    })
  })
})();




