
require('dotenv').config()


// Test
let myHeaders = new Headers();
    myHeaders.append('X-AUTH-TOKEN', process.env.GRANICUS)
    myHeaders.append('Content-Type', 'application/json')
    myHeaders.append('Accept', 'application/hal+json')
    fetch("https://cors-e.herokuapp.com/https://api.govdelivery.com/api/v2/topics", {
        method: "GET",
        headers: myHeaders
    }).then(r => r.json()).then(r => console.log(r))

// Test


let myHeaders = new Headers();
myHeaders.append('X-AUTH-TOKEN', process.env.GRANICUS)
myHeaders.append('Content-Type', 'application/json')
myHeaders.append('Accept', 'application/hal+json')
fetch(`https://cors-e.herokuapp.com/https://api.govdelivery.com/api/v2/accounts/${process.env.ACCOUNT}/reports/subscriber_activity/summary?start_date=1990-01-01&end_date=2019-03-28`, 
{
    method: "GET",
    headers: myHeaders
}).then(r => r.json()).then(r => console.log(r))

// 1) Total Subscribers
// URL: /api/v2/accounts/{account_id}/reports/subscriber_activity/summary
// Return: total_subscribers