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

    // let bulletin_detail = [
    //   {
    //     id: "name",
    //     alias: "Name of Metric",
    //     dataType: tableau.dataTypeEnum.string
    //   },
    //   {
    //     id: "this_wk",
    //     alias: "This Week",
    //     dataType: tableau.dataTypeEnum.int
    //   },
    //   {
    //     id: "prev_wk",
    //     alias: "Previous Week",
    //     dataType: tableau.dataTypeEnum.int
    //   },
    //   {
    //     id: "three_wk",
    //     alias: "Three Weeks Ago",
    //     dataType: tableau.dataTypeEnum.int
    //   },
    // ];

    // let engagement_schema = [
    //   {
    //     id: "name",
    //     alias: "Name of Metric",
    //     dataType: tableau.dataTypeEnum.string
    //   },
    //   {
    //     id: "this_wk",
    //     alias: "This Week",
    //     dataType: tableau.dataTypeEnum.int
    //   },
    //   {
    //     id: "prev_wk",
    //     alias: "Previous Week",
    //     dataType: tableau.dataTypeEnum.int
    //   },
    //   {
    //     id: "three_wk",
    //     alias: "Three Weeks Ago",
    //     dataType: tableau.dataTypeEnum.int
    //   },
    // ];

    let bulletin_rates = {
      id: "bulletin_rates",
      alias: "Bulletin Rates Table",
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

    // let bulletin_details = {
    //   id: "bulletin_details",
    //   alias: "Bulletin Details",
    //   columns: bulletin_detail
    // };

    // let engagement = {
    //   id: "engagement",
    //   alias: "Engagement + Subscribers",
    //   columns: engagement_schema
    // };




    schemaCallback([bulletins, bulletin_rates, subscribers /*, engagement, bulletin_details */ ]);
  };



  myConnector.getData = function (table, doneCallback) {
    // account number
    let account = "11723";

    // parse the string passed between Tableau lifecycle phases to get the user
    // supplied data into our calls
    let cd_data = JSON.parse(tableau.connectionData);
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

    // TODO TOPIC IDS

    let topics = {
      "America Counts"                : "USCENSUS_11939",
      "Census Academy"                : "USCENSUS_11971",
      "Census Jobs"                   : "USCENSUS_11941",
      "Census Partnerships"           : "USCENSUS_11958",
      "Census Updates"                : "USCENSUS_11926",
      "Census Updates for Business"   : "USCENSUS_11927",
      "Data Visualization Newsletter" : "USCENSUS_11932",
      "Statistics in Schools"         : "USCENSUS_11940",
      "Stats for Stories"             : "USCENSUS_11960"
    }
    


    // let allTimeStartDate = "2000-01-01";

    let base_url = "https://cors-e.herokuapp.com/https://api.govdelivery.com/api/v2/accounts/" + account + "/";

    // Bulletins summary url:
    let BSURL = "reports/bulletins/summary"
    // Subscriber summary url:
    let SSURL = "reports/subscriber_activity/summary"
    // Bulletins report url:
    let BURL = "reports/bulletins"
    // Engagement rate url
    let makeEURL = topicID => `reports/topics/${topicID}`
    // Total Subscriptions
    let makeTSURL = topicID => `topics/${topicID}/engagement_rate`

    let makeURL = (extURL, startDate, endDate) => `${base_url}${extURL}?start_date=${startDate}&end_date=${endDate}`

    
    let bulletin_summary_1wk = makeURL(BSURL, wks_1_date, new_date)
    let bulletin_summary_2wks = makeURL(BSURL, wks_2_date, wks_1_date)
    let bulletin_summary_3wks = makeURL(BSURL, wks_3_date, wks_2_date)

    let subscriber_summary_1wk = makeURL(SSURL, wks_1_date, new_date)
    let subscriber_summary_2wks = makeURL(SSURL, wks_2_date, wks_1_date)
    let subscriber_summary_3wks = makeURL(SSURL, wks_3_date, wks_2_date)

    let bulletin_1wk = makeURL(BURL, wks_1_date, new_date)
    let bulletin_2wk = makeURL(BURL, wks_2_date, wks_1_date)
    let bulletin_3wk = makeURL(BURL, wks_3_date, wks_2_date)

    let makeEngagement_1wk = topicID => makeURL(makeEURL(topicID), wks_1_date, new_date)
    let makeEngagement_2wk = topicID => makeURL(makeEURL(topicID), wks_2_date, wks_1_date)
    let makeEngagement_3wk = topicID => makeURL(makeEURL(topicID), wks_3_date, wks_2_date)

    let makeSubscriptions_1wk = topicID => makeURL(makeTSURL(topicID), wks_1_date, new_date)
    let makeSubscriptions_2wk = topicID => makeURL(makeTSURL(topicID), wks_2_date, wks_1_date)
    let makeSubscriptions_3wk = topicID => makeURL(makeTSURL(topicID), wks_3_date, wks_2_date)

    let engage_1wk = Object.values(topics).map(topic => makeEngagement_1wk(topic))
    let subscr_1wk = Object.values(topics).map(topic => makeSubscriptions_1wk(topic))
    let engage_2wk = Object.values(topics).map(topic => makeEngagement_2wk(topic))
    let subscr_2wk = Object.values(topics).map(topic => makeSubscriptions_2wk(topic))
    let engage_3wk = Object.values(topics).map(topic => makeEngagement_3wk(topic))
    let subscr_3wk = Object.values(topics).map(topic => makeSubscriptions_3wk(topic))

    let interleave = (arr1, arr2) => arr1.reduce((acc, cur, i) => acc.concat(cur, arr2[i]), [])

    let EplusS_1wk = interleave(engage_1wk, subscr_1wk)
    let EplusS_2wk = interleave(engage_2wk, subscr_2wk)
    let EplusS_3wk = interleave(engage_3wk, subscr_3wk)


    // Bulletin Summary
    let callList1 = [
      bulletin_summary_1wk,
      bulletin_summary_2wks,
      bulletin_summary_3wks
    ];
    // Subscriber Summary
    let callList2 = [
      subscriber_summary_1wk,
      subscriber_summary_2wks,
      subscriber_summary_3wks
    ];
    // Bulletin Detail
    let callList3 = [
      bulletin_1wk,
      bulletin_2wk,
      bulletin_3wk
    ];
    // Engagement Rates
    let callList4 = {
      EplusS_1wk, 
      EplusS_2wk, 
      EplusS_3wk
    } //?



    // TODO: If there are >= 20 results in `bulletin_activity_details` array, call again and create a new matrix
    const fetcher = async (url, acc) => {
      const response = await window.fetch(url, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/hal+json',
          'X-AUTH-TOKEN': key
        }
      })
      .then(async res => {
        let prime = await res.json()
        console.log("api call: " + url);
        console.log("prime:")
        console.table(prime)
        console.log("ok?:" + res.ok)
        if (table.tableInfo.id === "bulletin_details") {
          if (res.ok) {
            let cur = prime["bulletin_activity_details"]
            console.log("in bulletin_details...")
            if (typeof cur === "undefined") {
              console.log("cur == undefined")
              return acc
            } else if (cur.length < 20) {
              let last = acc.concat(cur)
              console.log("Less than 20 results: ")
              console.table(last)
              return last // bulletin details is an array
            } else if (cur.length == 20) {
              let next = acc.concat(cur)
              console.log("More than 20 results: ")
              console.table(next)
              console.log("recurring fetcher")
              await fetcher(`https://cors-e.herokuapp.com/https://api.govdelivery.com${prime._links.next.href}`, next)
            }
          } else if (table.tableInfo.id === "bulletin_details") {

          } else {
            console.log("no results in `next`... acc = ")
            console.table(acc)
            return acc
          }
        } else {
          return prime // summaries is an object
        }
      })
      
      return response
    }

    console.log("Iteration 28")

    const get_data = async calls => {

      const results = calls.map(url => fetcher(url, []))

      // For Object results, returns an array of promises containing objects
      // For Array results, returns an array of promises containing arrays of objects
      const dump = await Promise.all(results);

      const makeRateFromObj = (source, col, numProp, denomProp) => {
        console.log("in makeRateFromObj")
        console.log("after await: " + source[col][numProp])
        return source[col][numProp] / source[col][denomProp]
      }

      const makeSumFromObj = (source, col, ...counts) => {
        console.log("in makeSumFromObj ...counts = " + counts)
        console.log("after await -> counts.reduce...: " + counts.reduce((a, b) => source[col][a] + source[col][b], 0))
        return counts.reduce((a, b) => source[col][a] + source[col][b], 0)
      }

      const makeSumFromArr = (source, col, ...counts) => {
        console.log("in makeSumFromArr ...counts = " + counts)
        return source[col].reduce((acc, cur) => counts.reduce((a, b) => acc + a + cur[b], 0), 0)
      }

      // control logic for derived/calculated fields
      if (table.tableInfo.id === "bulletin_rates") {
        let keys_ = []
        let wk1_vals = []
        let wk2_vals = []
        let wk3_vals = []

        const pushOpenRates = (source, rows, col) => rows.push(makeRateFromObj(source, col, "opens_count", "total_delivered"))

        keys_.push("open_rate")
        pushOpenRates(dump, wk1_vals, 0)
        pushOpenRates(dump, wk2_vals, 1)
        pushOpenRates(dump, wk3_vals, 2)
        return zip(keys_, wk1_vals, wk2_vals, wk3_vals)

      } else if (table.tableInfo.id === "bulletin_details") {
        let keys_ = []
        let wk1_vals = []
        let wk2_vals = []
        let wk3_vals = []

        const pushTgiSums = (source, rows, col) => rows.push(makeSumFromArr(source, col, "nonunique_opens_count", "nonunique_clicks_count"))

        keys_.push("total_digital_impressions")
        pushTgiSums(dump, wk1_vals, 0)
        pushTgiSums(dump, wk2_vals, 1)
        pushTgiSums(dump, wk3_vals, 2)

        return zip(keys_, wk1_vals, wk2_vals, wk3_vals)

      } else if (table.tableInfo.id === "subscribers") {
        const keys_ = Object.keys(dump[0]);
        const wk1_vals = Object.values(dump[0]);
        const wk2_vals = Object.values(dump[1]);
        const wk3_vals = Object.values(dump[2]);
        
        const pushNewSubs = (source, rows, col) => rows.push(makeSumFromObj(source, col, "direct_subscribers", "overlay_subscribers", "upload_subscribers"))

        keys_.push("new_subscribers")
        pushNewSubs(dump, wk1_vals, 0)
        pushNewSubs(dump, wk2_vals, 0)
        pushNewSubs(dump, wk3_vals, 0)
        
      } else {

        const keys_ = Object.keys(dump[0]);
        const wk1_vals = Object.values(dump[0]);
        const wk2_vals = Object.values(dump[1]);
        const wk3_vals = Object.values(dump[2]);

        return zip(keys_, wk1_vals, wk2_vals, wk3_vals);

      }

    }

    const dataGetter = (urlList) => {
      get_data(urlList)
        .then(result => {
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

    if (table.tableInfo.id === "bulletins") {
      dataGetter(callList1)
    }

    if (table.tableInfo.id === "bulletin_rates") {
      dataGetter(callList1)
    }

    if (table.tableInfo.id === "subscribers") {
      dataGetter(callList2)
    }

    if (table.tableInfo.id === "bulletin_details") {
      dataGetter(callList3)
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
  });
})();




