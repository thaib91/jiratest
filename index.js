require("dotenv").config();
const {
  JIRA_ENDPOINT,
  JIRA_AUTH,
  JIRA_COOKIE,
  AIRTABLE_APIKEY,
  AIRTABLE_BASE_ID,
} = process.env;

const axios = require("axios");
var Airtable = require("airtable");
const { create } = require("domain");

// Jira Basic Authentication for specific API Endpoint (get all issues from a board)
const config = {
  method: "get",
  url: JIRA_ENDPOINT,
  headers: {
    Authorization: JIRA_AUTH,
    Cookie: JIRA_COOKIE,
  },
};

var created_record_ids = [];
console.log(created_record_ids);

// Authenticate into Airtable via API Key, and base ID (This can be found in Airtable settings and API doc)
var base = new Airtable({ apiKey: AIRTABLE_APIKEY }).base(AIRTABLE_BASE_ID);

async function deleteJiraIssues() {
  try {
      const recordIDs = 
    base("Bugs from Jira").destroy(
      ["recGJHVplCRuIGNxf"],
      function (err, deletedRecords) {
        if (err) {
          console.error(err);
          return;
        }
        console.log("Deleted", deletedRecords.length, "records");
      }
    );
  } catch (err) {
    console.log("Error: ", err);
  }
}

// deleteJiraIssues();



async function getJiraIssues() {
  try {
    const response = await axios(config); //authenticates GET to Jira

    let mapJiraData = response.data.issues.map((i) => {
      base("Bugs from Jira").create(
        [
          //Select specific table from the base to pass Jira data
          {
            fields: {
              // Within the fields object, the key will be record name and the value will be whatever you're trying to pass to Airtable from Jira
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
            // console.error(err);
            return;
          }
          records.forEach(function (record) {
            // created_record_ids.push(record.getId())
            console.log(record.getId());
          });
        }
      );
    });
  } catch (err) {
    // console.log("Error: ", err);
  }
}

getJiraIssues();
