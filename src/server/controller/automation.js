const axios = require('axios');
const fs = require('fs');

const LOG_FILE = '/var/logs/app.log';
const JENKINS_BASE_URL = 'http://localhost:8800/job/';
const JENKINS_AUTH = { username: 'your-jenkins-user', password: 'your-api-token' };

const ERROR_TO_JOB_MAPPING = {
    'Crash': 'RestartServer',
    'Memory Leak': 'ScaleUpInstance',
    'Database Connection Error': 'RestartDatabase',
};

function checkLogs() {
    const logs = fs.readFileSync(LOG_FILE, 'utf8');

    for (const [error, job] of Object.entries(ERROR_TO_JOB_MAPPING)) {
        if (logs.includes(error)) {
            console.log(`Detected: ${error}, triggering Jenkins job: ${job}`);
            triggerJenkinsJob(job);
            return; 
        }
    }
}

// Function to trigger the correct Jenkins job
async function triggerJenkinsJob(jobName) {
    try {
        const response = await axios.post(`${JENKINS_BASE_URL}${jobName}/build`, {}, { auth: JENKINS_AUTH });
        console.log(`Jenkins Job "${jobName}" Triggered:`, response.status);
    } catch (error) {
        console.error(`Failed to trigger Jenkins job "${jobName}":`, error.message);
    }
}

// Check logs every 30 seconds
setInterval(checkLogs, 30000);
