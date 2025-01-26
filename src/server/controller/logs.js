const { Client } = require('@elastic/elasticsearch');

const client = new Client({
    node: 'http://localhost:9200',
});

const fetchLogs = async (req,res) => {
    const { index } = req.params;
    try {
        const scrollSize = 1000; // Number of documents to fetch per scroll
            let documents = [];
            let response = await client.search({
                index,
                scroll: '1m', // Set the scroll timeout
                size: scrollSize,
                body: {
                    query: {
                        match_all: {},
                    },
                },
            });

            while (response.hits.hits.length > 0) {
                documents = documents.concat(response.hits.hits.map(hit => hit._source.message));
                const { _scroll_id } = response;

                // Fetch the next batch of results
                response = await client.scroll({
                    scroll_id: _scroll_id,
                    scroll: '1m',
                });
            }

            console.log(`Fetched total logs: ${documents.length}`);
            res.json(documents);
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ error: 'An error occurred while fetching logs.' });
    }
};

module.exports = { fetchLogs };