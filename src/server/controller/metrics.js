const { Client } = require("@elastic/elasticsearch");
const config = require("../config/config");

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

const fetchMetrics = async (req, res) => {
  const { index } = req.params;
  try {
    const cpu = [];
    const memory = [];
    const diskio = [];
    const network = [];
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
      documents = documents.concat(response.hits.hits.map((hit) => hit._source));
      const { _scroll_id } = response;
      response = await client.scroll({
        scroll_id: _scroll_id,
        scroll: "1m",
      });
    }

    // Process documents into the required arrays
    documents.forEach((doc) => {
      const timestamp = doc['@timestamp'];

      if (doc.system?.cpu?.total?.pct !== undefined) {
        cpu.push({ timestamp, value: doc.system.cpu.total.pct * 100 });
      }
      if (doc.system?.memory?.used?.pct !== undefined) {
        memory.push({ timestamp, value: doc.system.memory.used.pct * 100 });
      }
      if (doc.system?.diskio?.write?.bytes !== undefined) {
        diskio.push({ timestamp, value: doc.system.diskio.write.bytes });
      }
      if (doc.system?.network?.in?.bytes !== undefined) {
        network.push({ timestamp, value: doc.system.network.in.bytes });
      }
    });

    console.log(`Fetched total metrics: ${documents.length}`);
    res.json({ cpu, memory, diskio, network });
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ error: "An error occurred while fetching logs." });
  }
};

module.exports = { fetchMetrics };
