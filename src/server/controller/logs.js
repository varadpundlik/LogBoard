const { Client } = require("@elastic/elasticsearch");
const { ask } = require("../utils/llm");
const config = require("../config/config");
const { sendEmail } = require("./alert");

// const client = new Client({
//   node: config.elasticsearch_endpoint,
// });

const client = new Client({
  node: config.elasticsearch_endpoint,
  auth: {
    username: config.elasticsearch_access_key,
    password: config.elasticsearch_secret_key,
  },
});
const fetchLogs = async (req, res) => {
  const { index } = req.params;
  try {
    const scrollSize = 1000; // Number of documents to fetch per scroll
    let documents = [];
    let response = await client.search({
      index,
      scroll: "1m", // Set the scroll timeout
      size: scrollSize,
      body: {
        query: {
          match_all: {},
        },
      },
    });

    while (response.hits.hits.length > 0) {
      documents = documents.concat(
        response.hits.hits.map((hit) => hit._source.message)
      );
      const { _scroll_id } = response;

      // Fetch the next batch of results
      response = await client.scroll({
        scroll_id: _scroll_id,
        scroll: "1m",
      });
    }

    console.log(`Fetched total logs: ${documents.length}`);
    res.json(documents);
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ error: "An error occurred while fetching logs." });
  }
};

const checkAlert = async (req, res) => {
  const { index } = req.params;
  try {
    const scrollSize = 1000; // Number of documents to fetch per scroll
    let documents = [];
    let response = await client.search({
      index,
      scroll: "1m", // Set the scroll timeout
      size: scrollSize,
      body: {
        query: {
          match_all: {},
        },
      },
    });

    while (response.hits.hits.length > 0) {
      // Collect all logs
      documents = documents.concat(response.hits.hits.map((hit) => hit._source.message));

      const { _scroll_id } = response;

      // Fetch the next batch of results
      response = await client.scroll({
        scroll_id: _scroll_id,
        scroll: "1m",
      });
    }

    console.log(`Fetched total logs: ${documents.length}`);

    // Check if any log contains "Error"
    const errorMessages = documents.filter((message) => message.includes("Error"));

    // If error logs are found, send an email
    if (errorLogs.length > 0) {

      

      const mockReq = {
        body: {
          type: "error",
          email: "parthtagalpallewar123@gmail.com",
          name: "Parth", 
          _id: new Date().getTime().toString(), 
          errorLogs: errorMessages 
        }
      };

      const mockRes = {
        status: (code) => ({
          json: (data) => console.log(`Response [${code}]:`, data),
        }),
      };

      sendMail(mockReq, mockRes); 
    }

    res.json(documents);
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ error: "An error occurred while fetching logs." });
  }
};

const searchLogs = async (req, res) => {
  const { index } = req.params;
  const { query } = req.body;
  try {
    const response = await client.search({
      index,
      body: {
        query: {
          match: {
            message: query,
          },
        },
      },
    });

    const documents = response.hits.hits.map((hit) => hit._source.message);
    console.log(`Fetched total logs: ${documents.length}`);
    res.json(documents);
  } catch (error) {
    console.error("Error searching logs:", error);
    res.status(500).json({ error: "An error occurred while searching logs." });
  }
};

const logsSummarization = async (req, res) => {
  try {
    const response = await ask(`summary`);
    res.json(response);
  } catch (error) {
    console.error("Error summarizing logs:", error);
    res
      .status(500)
      .json({ error: "An error occurred while summarizing logs." });
  }
};

module.exports = { fetchLogs, searchLogs, logsSummarization };
