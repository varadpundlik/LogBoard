const dotenv = require('dotenv');
dotenv.config({ path: __dirname+"/config.env" });
const config = {
    elasticsearch_endpoint: "https://tetra-mutual-kit.ngrok-free.app/",
    // elasticsearch_endpoint: "http://localhost:9200",
    // elasticsearch_endpoint: "https://ffuctp6hz:ii8a278vrq@logboard-search-3216949732.us-east-1.bonsaisearch.net:443",
    elasticsearch_access_key: process.env.ELASTICSEARCH_ACCESS_KEY,
    elasticsearch_secret_key: process.env.ELASTICSEARCH_SECRET_KEY,
    mail: process.env.MAIL_ID,
    pass: process.env.PASS,
    db_url: process.env.DB_URL,
};

module.exports = config;