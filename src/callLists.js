import moment from 'moment'

// Get stuff from user input

/* ================================
Topics List
================================== */


const topics = {
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

/* =================================
URL Creating Functions
================================== */

// account number
const account = "11723";

// Latest date from user input

// function for creating dates formatted for Granicus API

const makeDate = (user_date, days_ago) => moment(user_date).subtract(days_ago, 'days').format('YYYY-MM-DD')
//
// const makeDate = (user_date, days_ago) => {
//   // create date from number of 'days_ago' from
//   const date = new Date().setDate(user_date.getDate() - days_ago);
//   const month = date.getUTCMonth() + 1; //jan = 0
//   const day = date.getUTCDate();
//   const year = date.getUTCFullYear();
//   return `${year}-${month}-${day}`
// }


const makeURLDateRange = (user_date, end, start) => `start_date=${makeDate(user_date, start)}&end_date=${makeDate(user_date, end)}`

const base_url = `https://cors-e.herokuapp.com/https://api.govdelivery.com/api/v2/accounts/${account}/`;

// Bulletins summary url:
const BSURL = "reports/bulletins/summary"
// Subscriber summary url:
const SSURL = "reports/subscriber_activity/summary"
// Bulletins report url:
const BURL = "reports/bulletins"
// Topic Summary
const makeTopicURL = topicID => `reports/topics/${topicID}`
// Engagement rate url
const makeEngageURL = topicID => `reports/topics/${topicID}/engagement_rate`

const makeURL = (user_date, extURL, _end, _start) => `${base_url}${extURL}?${makeURLDateRange(user_date, _end, _start)}`

const makeWklyURLArr = (user_date, str, ...days) => days.map( day => makeURL(user_date, str, day, day + 7))

const makeWkFnArr = (user_date, _topics, func, _end, _start) => Object.values(_topics).map( id => makeURL(user_date, func(id), _end, _start))

// const engage_1wk = Object.values(topics).map(topic => makeEngagement_1wk(topic))
const engage_1wk = user_date =>  makeWkFnArr(user_date, topics, makeEngageURL, 0, 7)
const topicS_1wk = user_date =>  makeWkFnArr(user_date, topics, makeTopicURL, 0, 7)
const engage_2wk = user_date =>  makeWkFnArr(user_date, topics, makeEngageURL, 7, 14)
const topicS_2wk = user_date =>  makeWkFnArr(user_date, topics, makeTopicURL, 7, 14)
const engage_3wk = user_date =>  makeWkFnArr(user_date, topics, makeEngageURL, 14, 21)
const topicS_3wk = user_date =>  makeWkFnArr(user_date, topics, makeTopicURL, 14, 21)

const interleave = (arr1, arr2) => arr1.reduce((acc, cur, i) => acc.concat(cur, arr2[i]), [])

const EplusS_1wk = user_date => interleave(engage_1wk(user_date), topicS_1wk(user_date))
const EplusS_2wk = user_date => interleave(engage_2wk(user_date), topicS_2wk(user_date))
const EplusS_3wk = user_date => interleave(engage_3wk(user_date), topicS_3wk(user_date))

// Bulletin Summary
const bulletinsCallList = user_date => makeWklyURLArr(user_date, BSURL, 0, 7, 14)

// Subscriber Summary
const subscribersCallList = user_date => makeWklyURLArr(user_date, SSURL, 0, 7, 14)

// Bulletin Detail
// const callList3 = makeWklyURLArr(BURL, 0, 7, 14)

// Engagement Rates = Array of arrays of URLS
const topicsCallList = user_date => [EplusS_1wk(user_date), EplusS_2wk(user_date), EplusS_3wk(user_date)]


export { bulletinsCallList, subscribersCallList, topicsCallList }