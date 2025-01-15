const express = require('express');
const { Client } = require('@elastic/elasticsearch');

const client = new Client({
    node: 'http://localhost:9200',
});

const app = express();
const port = 3000;

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/logs/:index', async (req, res) => {
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

        // Access the hits using response.hits.hits
        const documents = response.hits.hits.map(hit => hit._source);

        res.json(documents);
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ error: 'An error occurred while fetching logs.' });
    }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
