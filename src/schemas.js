/* =================================
  Schemas
  ================================== */

const rates_schema = [
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

const counts_schema =  [
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

/*
An error occurred while communicating with the data source.
  
  The web data connector returned invalid data.
  Error creating object for class TableInfo. The input data for one of the contained objects is invalid. The input Id 'bulletin_visibility?' is invalid. The Id must contain only letters, numbers or underscores.

  */
const tgi_schema = [
  {
    id: "created_at",                              
    alias: "Created at",
    dataType: tableau.dataTypeEnum.datetime
  },
  {
    id: "subject",                                 
    alias: "Subject",
    dataType: tableau.dataTypeEnum.string
  },
  {
    id: "to_text",                                 
    alias: "To Text:",
    dataType: tableau.dataTypeEnum.string
  },
  {
    id: "delivery_status_name",                    
    alias: "Delivery Status Name",
    dataType: tableau.dataTypeEnum.string
  },
  {
    id: "addresses_count",                         
    alias: "Addresses Count",
    dataType: tableau.dataTypeEnum.int
  },
  {
    id: "success_count",                           
    alias: "Success Count",
    dataType: tableau.dataTypeEnum.int
  },
  {
    id: "failed_count",                            
    alias: "Failed Count",
    dataType: tableau.dataTypeEnum.int
  },
  {
    id: "percent_success",                         
    alias: "Percent Success",
    dataType: tableau.dataTypeEnum.float
  },
  {
    id: "immediate_email_recipients",              
    alias: "Immediate Email Recipients",
    dataType: tableau.dataTypeEnum.int
  },
  {
    id: "emails_delivered",                        
    alias: "Emails Delivered",
    dataType: tableau.dataTypeEnum.int
  },
  {
    id: "emails_failed",                           
    alias: "Emails Failed",
    dataType: tableau.dataTypeEnum.int
  },
  {
    id: "percent_emails_delivered",                
    alias: "Percent Emails Delivered",
    dataType: tableau.dataTypeEnum.float
  },
  {
    id: "opens_count",                             
    alias: "Opens Count",
    dataType: tableau.dataTypeEnum.int
  },
  {
    id: "percent_opened",                          
    alias: "Percent Opened",
    dataType: tableau.dataTypeEnum.float
  },
  {
    id: "nonunique_opens_count",                   
    alias: "Nonunique Opens Count",
    dataType: tableau.dataTypeEnum.int
  },
  {
    id: "links_count",                             
    alias: "Links Count",
    dataType: tableau.dataTypeEnum.int
  },
  {
    id: "click_rate",                              
    alias: "Click Rate",
    dataType: tableau.dataTypeEnum.float
  },
  {
    id: "clicks_count",                            
    alias: "Clicks Count",
    dataType: tableau.dataTypeEnum.int
  },
  {
    id: "nonunique_clicks_count",                  
    alias: "Nonunique Clicks Count",
    dataType: tableau.dataTypeEnum.int
  },
  {
    id: "shared_views",                            
    alias: "Shared Views",
    dataType: tableau.dataTypeEnum.int
  },
  {
    id: "sender_email",                            
    alias: "Sender Email",
    dataType: tableau.dataTypeEnum.string
  },
  {
    id: "digest_email_recipients",                 
    alias: "Digest Email Recipients",
    dataType: tableau.dataTypeEnum.int
  },
  {
    id: "wireless_recipients",                     
    alias: "Wireless Recipients",
    dataType: tableau.dataTypeEnum.int
  },
  {
    id: "wireless_delivered",                      
    alias: "Wireless Delivered",
    dataType: tableau.dataTypeEnum.int
  },
  {
    id: "wireless_failed_count",                   
    alias: "Wireless Failed Count",
    dataType: tableau.dataTypeEnum.int
  },
  {
    id: "bulletin_visibility",
    alias: "Bulletin Visibility?",
    dataType: tableau.dataTypeEnum.string
  },
  {
    id: "publish_to_facebook",                     
    alias: "Publish to Facebook",
    dataType: tableau.dataTypeEnum.string
  },
  {
    id: "publish_to_twitter",                      
    alias: "Publish to Twitter",
    dataType: tableau.dataTypeEnum.string
  },
  {
    id: "publish_to_rss",
    alias: "Publish to RSS?",
    dataType: tableau.dataTypeEnum.string
  },
  {
    id: "wireless_unique_clicks",                  
    alias: "Wireless Unique Clicks",
    dataType: tableau.dataTypeEnum.int
  },
  {
    id: "wireless_nonunique_clicks",               
    alias: "Wireless Nonunique Clicks",
    dataType: tableau.dataTypeEnum.int
  },
  {
    id: "facebook_nonunique_clicks",               
    alias: "Facebook Nonunique Clicks",
    dataType: tableau.dataTypeEnum.int
  },
  {
    id: "twitter_nonunique_clicks",                
    alias: "Twitter Nonunique Clicks",
    dataType: tableau.dataTypeEnum.int
  }
]


/* =================================
Schema Representatives
================================== */

// JSON.parse(JSON.stringify...)) ugliness required for Tableau:
// https://github.com/tableau/webdataconnector/issues/115#issuecomment-254354375

const bulletins_schema = {
  id: "bulletins",
  alias: "Bulletins",
  columns: JSON.parse(JSON.stringify([...counts_schema]))
};

const bulletin_rates_schema = {
  id: "bulletin_rates",
  alias: "Bulletin Rates",
  columns: JSON.parse(JSON.stringify([...rates_schema]))
};

const subscribers_schema = {
  id: "subscribers",
  alias: "Subscribers",
  columns: JSON.parse(JSON.stringify([...counts_schema]))
};

// const subscriber_rates_schema = {
//   id: "subscriber_rates",
//   alias: "Subscriber Rates",
//   columns: JSON.parse(JSON.stringify([...rates_schema]))
// };

const synthetic_rates_schema = {
  id: "synthetic_rates",
  alias: "Synthesized Rates",
  columns: JSON.parse(JSON.stringify([...rates_schema]))
};

const topics_engagement_schema = {
  id: "topics",
  alias: "Topic Engagement + Subscribers",
  columns: JSON.parse(JSON.stringify([...rates_schema]))
};

const bulletin_details_schema = {
  id: "bulletin_details",
  alias: "Bulletin Details",
  columns: tgi_schema
};

export {
  bulletins_schema,
  bulletin_rates_schema,
  subscribers_schema,
  // subscriber_rates_schema,
  synthetic_rates_schema,
  topics_engagement_schema,
  bulletin_details_schema
}