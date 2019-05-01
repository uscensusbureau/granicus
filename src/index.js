// require('es6-promise').polyfill();

/*
Tableau's internal browser is old. In order to make dealing with multiple
asynchronous API calls, waiting for them and processing them *in order*, we use
a combination of browserify (with babelify) and some polyfills

Using the CLI:

browserify ./src/index.js -o bundle.js -t [ babelify --presets [ @babel/preset-env ] ]

 */

/* =================================
Polyfills and library functions
================================== */ 

import 'babel-polyfill';
import { bulletins_schema,
         bulletin_rates_schema,
         subscribers_schema,
         subscriber_rates_schema,
         topics_engagement_schema
       } from "./schemas"
import { fetcher, arrayFetcher, detailFetcher } from "./fetchers";
import { makeSumFromObj, makeRateFromObj, makeSumFromArr } from "./derivatives";
import { dumpNZIP, augmentDumpNZip, createDumpNZIP } from "./payloadModifiers";
import { topicsCallList, subscribersCallList, bulletinsCallList } from "./callLists";

(function () {
  // Create the connector object
 const myConnector = tableau.makeConnector();

  
  myConnector.getSchema = function (schemaCallback) {
    
    schemaCallback([
      topics_engagement_schema,
      bulletins_schema,
      bulletin_rates_schema,
      subscribers_schema,
      subscriber_rates_schema
      /*, bulletin_details */ ]);
  };
  
  myConnector.getData = function (table, doneCallback) {
  
    // Data passed through lifecycle phases (Interactive -> Data Gathering) via tableau.connectionData
    const cd_data = JSON.parse(tableau.connectionData);
    const KEY = cd_data.key
    const DATE = cd_data.end_date
    
    // Table ID for case by case deploys
    
    let TABLEID = table.tableInfo.id
    
  
    tableau.log("Iteration 66")
    

    /* =================================
    Data Getters
    ================================== */

    const makeCalls = async calls => {

      const results = calls.map(url => fetcher(TABLEID, KEY)(url))
      
      let dump = await Promise.all(results);
  
      switch (TABLEID) {
        case "subscribers": {
          const pushNewSubs = {
            name: "new_subscribers",
            pusher: (source, col) => makeSumFromObj(source, col, "direct_subscribers", "overlay_subscribers", "upload_subscribers", "all_network_subscribers")
          }
          return augmentDumpNZip(dump, pushNewSubs)
        }
        case "bulletin_rates": {
          const pushOpenRates = {
            name: "open_rate",
            pusher: (source, col) => makeRateFromObj(source, col, "opens_count", "total_delivered")
          }
          return createDumpNZIP(dump, pushOpenRates)
        }
        case "subscriber_rates": {
          const pushUnsubRate = {
            name: "unsubscribe_rate",
            pusher: (source, col) => makeRateFromObj(source, col, "deleted_subscribers", "total_subscribers")
          }
          return createDumpNZIP(dump, pushUnsubRate)
        }
        default: {
          return dumpNZIP(dump);
        }
      }
      
    }

    const makeCallsArr = async calls => {

      const results = calls.map( urls => arrayFetcher(TABLEID, KEY)(urls))

      // For Object results, returns an array of promises containing objects
      // For Array results, returns an array of promises containing arrays of objects
      const dump = await Promise.all(results);


      // control logic for derived/calculated fields
      if (TABLEID === "topics") {
        // const pushOpenRates = {
        //   name: "open_rate",
        //   pusher: (source, wk, col) => wk.push(makeRateFromObj(source, col, "opens_count", "total_delivered"))
        // }
        
        // return createDumpNZIP(dump, pushOpenRates)
        tableau.log(`
        =====================
        COMPLETE
        =====================
        `)
        return dumpNZIP(dump)
      }
    }


    /* =================================
    Table Constructors
    ================================== */

    const dataGetter = urlList => {
      makeCalls(urlList)
        .then(result => {
          table.appendRows(
            result.map(k => ({
              "name"    : k[0],
              "this_wk" : k[1],
              "prev_wk" : k[2],
              "three_wk": k[3]
            })
          )
        )
        doneCallback()
      })
    }

    const arrDataGetter = urlList => {
      makeCallsArr(urlList)
        .then(result => {
          table.appendRows(
            result.map(k => ({
              "name"    : k[0],
              "this_wk" : k[1],
              "prev_wk" : k[2],
              "three_wk": k[3]
            })
          )
        )
        doneCallback()
      })
    }
 
 
    
    /* =================================
    Table Targets
    ================================== */ 


    
    switch (TABLEID) {
      case "bulletins":
      case "bulletin_rates": {
        dataGetter(bulletinsCallList(DATE))
        break
      }
      case "subscribers":
      case "subscriber_rates": {
        dataGetter(subscribersCallList(DATE))
        break
      }
      case "topics": {
        arrDataGetter(topicsCallList(DATE))
        break
      }
      default: tableau.log("SLIPPED THROUGH THE TABLE TARGETS")
    }
    //
    // else if (table.tableInfo.id === "bulletin_details") {
    //   dataGetter(callList3)
    // }


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
  });
})();




