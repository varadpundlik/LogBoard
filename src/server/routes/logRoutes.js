const logsRouter= require('express').Router();

const { fetchLogs } = require('../controller/logs');

logsRouter.get('/:index', fetchLogs);

module.exports ={ logsRouter };