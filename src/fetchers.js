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
  tableau.log("api call: " + url);
  tableau.log("prime:")
  tableau.log(prime)
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
    })
    
    const prime = await result.json()
    tableau.log("prime:")
    tableau.log(prime)
    return prime
  })
  
  const promiseArr = await Promise.all(responses)
  
  return promiseArr.reduce( (acc, res, i) => {
    
    // evens are engagement rate and odds are topic summaries
    if (tableID === "topics") {
      if (i % 2 === 0) {
        let todo = {}
        todo[`${res["name"]} Engagement Rate`] = res["engagement_rate"]
        tableau.log("engagement_rate: ")
        tableau.log(todo)
        tableau.log("acc:")
        tableau.log(acc)
        return Object.assign(acc, todo)
      } else {
        let todo = {}
        todo[`${res["name"]} Subscribers`] = res["total_subscriptions_to_date"]
        tableau.log("Subscribers: ")
        tableau.log(todo)
        tableau.log("acc:")
        tableau.log(acc)
        return Object.assign(acc, todo)
      }
    }
  }, {})
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
  tableau.log("api call: " + url);
  tableau.log("prime:")
  tableau.log(prime)
  tableau.log("ok?:" + result.ok)
  
  if (tableID === "bulletin_details") {
    if (result.ok) {
      const cur = prime["bulletin_activity_details"]
      tableau.log("in bulletin_details...")
      if (typeof cur === "undefined") {
        tableau.log("cur == undefined")
        return acc
      } else if (cur.length < 20) {
        const last = acc.concat(cur)
        tableau.log("Less than 20 results: ")
        tableau.log(last)
        return last // bulletin details is an array
      } else if (cur.length === 20) {
        const todo = acc.concat(cur)
        tableau.log("More than 20 results: ")
        tableau.log(todo)
        tableau.log("recurring fetcher")
        await fetcher(`https://cors-e.herokuapp.com/https://api.govdelivery.com${prime._links.next.href}`, todo)
      }
    } else {
      tableau.log("no results in `next`... acc = ")
      tableau.log(acc)
      return acc
    }
    
  } else {
    
    return prime // summaries is an object
    
  }
}


export {fetcher, arrayFetcher, detailFetcher}