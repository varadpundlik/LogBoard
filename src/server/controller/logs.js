const { Client } = require('@elastic/elasticsearch');

const client = new Client({
    node: 'http://localhost:9200',
});

const fetchLogs = async (req,res) => {
    const { index } = req.params;
    try {
        const response = await client.search({
            index,
            body: {
                query: {
                    match_all: {},
                },
            },
        });

        const documents = response.hits.hits.map(hit =>hit._source.message);
        console.log('Fetched logs numbers:', documents.length);
        res.json(documents);
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ error: 'An error occurred while fetching logs.' });
    }
};

module.exports = { fetchLogs };