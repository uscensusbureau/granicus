
/* =================================
Fetching Functions
================================== */

const fetcher = (tableID, key) => async url => {
  const result = await window.fetch(url, {
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/hal+json',
      'X-AUTH-TOKEN': key
    }
  })
  
  const prime = await result.json()
  console.log("api call: " + url);
  console.log("prime:")
  console.table(prime)
  return prime // summaries is an object
}



// handle Many calls in one weekly bundle (e.g., Engagement Rates)
const arrayFetcher = (tableID, key) => async urls => {
  
  const responses = await urls.map(async url => {
    const result = await window.fetch(url, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/hal+json',
        'X-AUTH-TOKEN': key
      }
    }).then(response => {
      if (response.ok){
        return response.json()
      } else {
        return {}
      }
    })
    
    const prime = await result
    console.log("prime:")
    console.table(prime)
    return prime
  })
  
  const promiseArr = await Promise.all(responses)
  
  
  // topics table = array of promises of objects
  // return a single object with k/v pairs
  
  switch (tableID) {
    case "topics" : {
      return promiseArr.reduce((acc, res, i) => {
        if (res["name"]) {
          // evens are engagement rate and odds are topic summaries
          if (i % 2 === 0) {
            let todo = {}
            todo[`${res["name"]} Engagement Rate`] = res["engagement_rate"]
            // console.log("engagement_rate: ")
            // console.log(todo)
            // console.log("acc:")
            // console.log(acc)
            return Object.assign(acc, todo)
          } else {
            let todo = {}
            todo[`${res["name"]} Subscribers`] = res["total_subscriptions_to_date"]
            // console.log("Subscribers: ")
            // console.log(todo)
            // console.log("acc:")
            // console.log(acc)
            return Object.assign(acc, todo)
          }
        } else {
          return acc
        }
      }, {})
    }
    // bulletin details table = array of promises of array (get`bulletin_activity_details`)
    // of objects
    // return a single array of objects (one for each bulletin)
    case "bulletin_details" : {
      console.log("in arrayFetcher: bulletin_details")
      return promiseArr.reduce((acc, res) => {
        if (res["bulletin_activity_details"]) {
          console.log("bulletin_activity_details: subject")
          console.log(res["bulletin_activity_details"]["subject"])
          return acc.concat(res["bulletin_activity_details"])
        } else {
          return acc
        }
      }, [])
    }
  }
}



// TODO: Figure out a way to reduce response time (currently >30s = timeout)
const detailFetcher = (tableID, key) => async (url, acc) => {
  const result = await window.fetch(url, {
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/hal+json',
      'X-AUTH-TOKEN': key
    }
  })
  
  const prime = await result.json()
  console.log("api call: " + url);
  console.log("prime:")
  console.table(prime)
  console.log("ok?:" + result.ok)
  
  if (tableID === "bulletin_details") {
    if (result.ok) {
      const cur = prime["bulletin_activity_details"]
      console.log("in bulletin_details...")
      if (typeof cur === "undefined") {
        console.log("cur == undefined")
        return acc
      } else if (cur.length < 20) {
        const last = acc.concat(cur)
        console.log("Less than 20 results: ")
        console.log(last)
        return last // bulletin details is an array
      } else if (cur.length === 20) {
        const todo = acc.concat(cur)
        console.log("More than 20 results: ")
        console.log(todo)
        console.log("recurring fetcher")
        await fetcher(`https://cors-e.herokuapp.com/https://api.govdelivery.com${prime._links.next.href}`, todo)
      }
    } else {
      console.log("no results in `next`... acc = ")
      console.table(acc)
      return acc
    }
    
  } else {
    
    return prime // summaries is an object
    
  }
}


export {fetcher, arrayFetcher, detailFetcher}