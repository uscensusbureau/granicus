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

const subscriber_rates_schema = {
  id: "subscriber_rates",
  alias: "Subscriber Rates",
  columns: JSON.parse(JSON.stringify([...rates_schema]))
};

//const bulletin_details = {
//   id: "bulletin_details",
//   alias: "Bulletin Details",
//   columns:JSON.parse(JSON.stringify ([...counts_schema]
// };

const topics_engagement_schema = {
  id: "topics",
  alias: "Topic Engagement + Subscribers",
  columns: JSON.parse(JSON.stringify([...rates_schema]))
};


export {bulletins_schema, bulletin_rates_schema, subscribers_schema, subscriber_rates_schema, topics_engagement_schema}