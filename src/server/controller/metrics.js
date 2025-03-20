const { Client } = require("@elastic/elasticsearch");
const config = require("../config/config");
const { sendMail } = require("./alert");

const client = new Client({
  node: config.elasticsearch_endpoint,
  auth: {
    username: config.elasticsearch_access_key,
    password: config.elasticsearch_secret_key,
  },
});

const fetchMetrics = async (req, res) => {
  const { index } = req.params;
  const limit = 5; // Hardcoded limit for the latest 5 entries per metric

  try {
    // Function to fetch the latest `limit` records for a specific field
    const fetchLatestRecords = async (field) => {
      const response = await client.search({
        index,
        size: limit,
        body: {
          sort: [{ "@timestamp": { order: "desc" } }], // Sort by timestamp in descending order
          query: {
            exists: { field }, // Only fetch documents where the field exists
          },
        },
      });

      return response.hits.hits.map((hit) => hit._source);
    };

    // Fetch the latest records for each metric
    const cpuRecords = await fetchLatestRecords("system.cpu.total.pct");
    const memoryRecords = await fetchLatestRecords("system.memory.used.pct");
    const diskioRecords = await fetchLatestRecords("system.diskio.write.bytes");
    const networkRecords = await fetchLatestRecords("system.network.in.bytes");

    // Process the records into the required arrays
    const cpu = cpuRecords.map((doc) => ({
      timestamp: doc["@timestamp"],
      value: doc.system.cpu.total.pct * 100,
    }));

    const memory = memoryRecords.map((doc) => ({
      timestamp: doc["@timestamp"],
      value: doc.system.memory.used.pct * 100,
    }));

    const diskio = diskioRecords.map((doc) => ({
      timestamp: doc["@timestamp"],
      read_bytes: doc.system.diskio.read?.bytes || 0,
      write_bytes: doc.system.diskio.write?.bytes || 0,
    }));

    const network = networkRecords.map((doc) => ({
      timestamp: doc["@timestamp"],
      in_bytes: doc.system.network.in?.bytes || 0,
      out_bytes: doc.system.network.out?.bytes || 0,
      in_errors: doc.system.network.in?.errors || 0,
      out_errors: doc.system.network.out?.errors || 0,
    }));

    // CPU usage threshold check and email trigger
    cpuRecords.forEach((doc) => {
      if (doc.system?.cpu?.total?.pct !== undefined && doc.system.cpu.total.pct * 100 > 200) {
        const mockReq = {
          body: {
            type: "cpu",
            email: "parthtagalpallewar123@gmail.com",
            name: "System Admin",
            cpuUsage: doc.system.cpu.total.pct * 100, // High CPU Usage %
          },
        };
        const mockRes = {
          status: (code) => ({
            json: (data) => console.log(`Response [${code}]:`, data),
          }),
        };

        sendMail(mockReq, mockRes);
      }
    });

    console.log(`Fetched latest ${limit} records for each metric`);
    res.json({ cpu, memory, diskio, network });
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ error: "An error occurred while fetching logs." });
  }
};

module.exports = { fetchMetrics };