require("dotenv").config();

// Desstructured elements from .env
const {
  JIRA_ENDPOINT,
  JIRA_AUTH,
  JIRA_COOKIE,
  AIRTABLE_APIKEY,
  AIRTABLE_BASE_ID,
} = process.env;

const axios = require("axios");
var Airtable = require("airtable");
// const { create } = require("domain");

// Jira Basic Authentication for specific API Endpoint (get all issues from a board)
const config = {
  method: "get",
  url: JIRA_ENDPOINT,
  headers: {
    Authorization: JIRA_AUTH,
    Cookie: JIRA_COOKIE,
  },
};


// Authenticate into Airtable via API Key, and base ID (This can be found in Airtable settings and API doc)
var base = new Airtable({ apiKey: AIRTABLE_APIKEY }).base(AIRTABLE_BASE_ID);



async function getJiraIssues() {
  try {
    const response = await axios(config); //authenticates GET to Jira

    let mapJiraData = response.data.issues.map((i) => {
      base("Bugs from Jira").create(
        [
          //You can replace "Bugs from Jira" with any other table from your base
          {
            fields: {
              // Within the fields object, the key will be record name and the value will be the element you're trying to pass to Airtable from Jira
              id: i.id,
              "issue id": i.key,
              name: i.fields.issuetype.name,
              description: i.fields.description,
              URL: i.self,
            },
          },
        ],
        function (err, records) {
          if (err) {
            console.error(err);
            return;
          }
          records.forEach(function (record) {
            console.log(record.getId());
            //outputs in console all recordIDs that are created with the import
          });
        }
      );
    });
  } catch (err) {
    console.log("Error: ", err);
  }
}

getJiraIssues();
