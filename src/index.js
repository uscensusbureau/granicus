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
// special polyfill for fetch support (not provided by babel-polyfill)
import 'fetch-ie8'

import {
  bulletins_schema,
  bulletin_rates_schema,
  subscribers_schema,
  subscriber_rates_schema,
  topics_engagement_schema,
  bulletin_details_schema
} from "./schemas"
import { fetcher, arrayFetcher, detailFetcher } from "./fetchers";
import { makeSumFromObj, makeRateFromObj, makeSumFromArr } from "./derivatives";
import { dumpNZIP, augmentDumpNZip, createDumpNZIP } from "./payloadModifiers";
import { topicsCallList, subscribersCallList, bulletinsCallList, bulletinDetailsCallsForDays } from "./callLists";

(function () {
  // Create the connector object
 const myConnector = tableau.makeConnector();

  
  myConnector.getSchema = function (schemaCallback) {
    
    schemaCallback([
      topics_engagement_schema,
      bulletins_schema,
      bulletin_rates_schema,
      subscribers_schema,
      subscriber_rates_schema,
      bulletin_details_schema
      /*, bulletin_details */ ]);
  };
  
  myConnector.getData = function (table, doneCallback) {
  
    // Data passed through lifecycle phases (Interactive -> Data Gathering) via tableau.connectionData
    const cd_data = JSON.parse(tableau.connectionData);
    const KEY = cd_data.key
    const DATE = cd_data.end_date
    
    // Table ID for case by case deploys
    
    let TABLEID = table.tableInfo.id
    
  
    console.log("Iteration 76")
    

    /* =================================
    Data Getters
    ================================== */

    const makeCalls = async calls => {

      const results = calls.map(url => fetcher(TABLEID, KEY)(url))
      
      let dump = await Promise.all(results);
  
      switch (TABLEID) {
        // case "bulletins" :
        case "bulletin_rates": {
          const openRates = {
            name: "open_rate",
            pusher: (source, col) => makeRateFromObj(source, col, "opens_count", "total_delivered")
          }
          const clickRates = {
            name: "click_rates",
            pusher: (source, col) => makeRateFromObj(source, col, "clicks_count", "total_delivered")
          }
          const deliveryRates = {
            name: "delivery_rates",
            pusher: (source, col) => makeRateFromObj(source, col, "total_delivered", "total_recipients")
          }
          return createDumpNZIP(dump, openRates, clickRates, deliveryRates)
        }
        case "subscribers": {
          const newSubs = {
            name: "new_subscribers",
            pusher: (source, col) => makeSumFromObj(source, col, "direct_subscribers", "overlay_subscribers", "upload_subscribers", "all_network_subscribers")
          }
          return augmentDumpNZip(dump, newSubs)
        }
        case "subscriber_rates": {
          const unsubRate = {
            name: "unsubscribe_rate",
            pusher: (source, col) => makeRateFromObj(source, col, "deleted_subscribers", "total_subscribers")
          }
          return createDumpNZIP(dump, unsubRate)
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
        
        console.log(`
        =====================
        COMPLETE
        =====================
        `)
        console.table(dump)
        return dumpNZIP(dump)
      }
    }

    const makeCallsDetails = async calls => {
      const dump = await arrayFetcher(TABLEID, KEY)(calls)
      
      // const dump = await Promise.all(results) // will be an array of promises of objects
      
      console.log("in makeCallsDetails:")
      console.table(dump)
      
      return dump
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
        ))
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
        ))
        doneCallback()
      })
    }
    
    const detailGetter = urlList => {
      makeCallsDetails(urlList)
      .then( results => {
        table.appendRows(
          results
        //   results.map( obj => {
        //     Object.keys(obj).reduce((acc, cur) => {
        //       let todo = {}
        //       todo[`${cur}`] = obj[cur]
        //       return Object.assign(acc, todo)
        //     }, {})
        //   })
        )}
      )
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
      case "bulletin_details": {
        detailGetter(bulletinDetailsCallsForDays(DATE, 21))
        break
      }
      default: console.log("SLIPPED THROUGH THE TABLE TARGETS")
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




