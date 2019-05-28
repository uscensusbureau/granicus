import moment from 'moment'
// import fullTopicMap from '../sprints/topicObj'

/* =================================
URL Creating Functions
================================== */

// account number
const account = "11723";

/* =================================
General Purpose
================================== */

// function for creating dates formatted for Granicus API
// `user_date` = Latest date from user input
const makeDate = (user_date, days_ago) => moment(user_date).subtract(days_ago, 'days').format('YYYY-MM-DD')

const base_url = `https://cors.app.cloud.gov/https://api.govdelivery.com/api/v2/accounts/${account}/`;

const makeURLDateRange = (user_date, end, start) => `start_date=${makeDate(user_date, start)}&end_date=${makeDate(user_date, end)}`

const makeURL = (user_date, extURL, end, start) => `${base_url}${extURL}?${makeURLDateRange(user_date, end, start)}`

const makeWklyURLArr = (user_date, extURL, ...days) => days.map( day => makeURL(user_date, extURL, day, day + 6))
const makeWklyURLArrNudge = (user_date, str, ...days) => days.map( day => makeURL(user_date, str, day - 1, day + 6))

const makeWkFnArr = (user_date, _topics, func, end, start) => Object.values(_topics).map( id => makeURL(user_date, func(id), end, start))

const interleave = (arr1, arr2) => arr1.reduce((acc, cur, i) => acc.concat(cur, arr2[i]), [])
const interleaveWks = (wks1, wks2) => [[],[],[]].map((wk, i) => wk.concat([wks1[i], wks2[i]]))

/* =================================
Endpoints (extensions)
================================== */

// Bulletins summary url:
const BSURL = "reports/bulletins/summary"
// Subscriber summary url:
const SSURL = "reports/subscriber_activity/summary"
// Bulletins report url:
const BURL = "reports/bulletins"

/* =================================
Shallow Calls
================================== */

// Bulletin Summary
const bulletinsCallList = user_date => makeWklyURLArrNudge(user_date, BSURL, 0, 7, 14)

// Subscriber Summary
const subscribersCallList = user_date => makeWklyURLArr(user_date, SSURL, 0, 7, 14)

// Bulletin Detail
// const callList3 = makeWklyURLArr(BURL, 0, 7, 14)

/* =================================
Synthesized (subscriber_activity & bulletins - summaries) Calls Array
================================== */

const syntheticCallList = user_date => interleaveWks(subscribersCallList(user_date), bulletinsCallList(user_date))

/* ================================
Topics List
================================== */


const topics = {
  "General 2020 Census Updates"   : "289016",
  "America Counts"                : "449122", // "USCENSUS_11939",
  "Census Academy"                : "454831", // "USCENSUS_11971",
  "Census Jobs"                   : "449126", // "USCENSUS_11941",
  "Census Partnerships"           : "452433", // "USCENSUS_11958",
  "Census Updates"                : "444983", // "USCENSUS_11926",
  "Census Updates for Business"   : "444992", // "USCENSUS_11927",
  "Data Visualization Newsletter" : "447782", // "USCENSUS_11932",
  "Statistics in Schools"         : "449124", // "USCENSUS_11940",
  "Stats for Stories"             : "452958"  // "USCENSUS_11960"
}

// let topics = fullTopicMap

/* =================================
Engagement Calls Array (deep)
================================== */

// Topic Summary
const makeTopicURL = topicID => `reports/topics/${topicID}`
// Engagement rate url
const makeEngageURL = topicID => `reports/topics/${topicID}/engagement_rate`

// const engage_1wk = user_date =>  makeWkFnArr(user_date, topics, makeEngageURL, 0, 7)
// const engage_2wk = user_date =>  makeWkFnArr(user_date, topics, makeEngageURL, 8, 15)
// const engage_3wk = user_date =>  makeWkFnArr(user_date, topics, makeEngageURL, 16, 23)

const topicS_1wk = user_date =>  makeWkFnArr(user_date, topics, makeTopicURL, 0, 6)
const topicS_2wk = user_date =>  makeWkFnArr(user_date, topics, makeTopicURL, 7, 13)
const topicS_3wk = user_date =>  makeWkFnArr(user_date, topics, makeTopicURL, 14, 22)

// const EplusS_1wk = user_date => interleave(engage_1wk(user_date), topicS_1wk(user_date))
// const EplusS_2wk = user_date => interleave(engage_2wk(user_date), topicS_2wk(user_date))
// const EplusS_3wk = user_date => interleave(engage_3wk(user_date), topicS_3wk(user_date))

// Engagement Rates = Array of arrays of URLS
// const topicsCallList = user_date => [EplusS_1wk(user_date), EplusS_2wk(user_date), EplusS_3wk(user_date)]
const topicsCallList = user_date => [topicS_1wk(user_date), topicS_2wk(user_date), topicS_3wk(user_date)]



/* =================================
Bulletin Details Calls Array
================================== */


const makeTopicParams = topicIDs => "".concat(...Object.values(topicIDs).map(topicID => `&topic%5B%5D=${topicID}`))

const bulletinDetailsCallsForDays = (user_date, days) => [...Array(days).keys()].map(day => {
  console.log("in bulletinDetailsCallsForDays")
  let result = `${makeURL(user_date, BURL, day, day + 1)}${makeTopicParams(topics)}`
  console.log("url:")
  console.log(result)
  return result
})

export { bulletinsCallList, subscribersCallList, syntheticCallList, topicsCallList, bulletinDetailsCallsForDays }
