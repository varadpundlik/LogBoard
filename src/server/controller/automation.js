require('dotenv').config({path: '../config.env'});
const axios = require('axios');
const fs = require('fs');
const {ask} = require('../utils/llm');

const JENKINS_BASE_URL = 'http://localhost:8800/job/';
const JENKINS_API_TOKEN = process.env.JENKINS_API_TOKEN;
const JENKINS_AUTH = { username: 'varadpundlik', password: JENKINS_API_TOKEN };

const ERROR_TO_JOB_MAPPING = {
    'Crash': 'RestartServer',
    'Memory Leak': 'ScaleUpInstance',
    'Database Connection Error': 'RestartDatabase',
};

async function checkLogs(req,res) {
    try{
        const job=await ask('automation');
        console.log(job);
        if(job.job=="None"){
            res.json({message:"No error found"});
        }
        else{
            triggerJenkinsJob(job);
            res.json({message:`Job triggered ${job}`});
        }
    }
    catch(err){
        console.error(err);
    }
}

async function triggerJenkinsJob(jobName) {
    try {
        const response = await axios.post(`${JENKINS_BASE_URL}${jobName}/build`, {}, { auth: JENKINS_AUTH });
        console.log(`Jenkins Job "${jobName}" Triggered:`, response.status);
    } catch (error) {
        console.error(`Failed to trigger Jenkins job "${jobName}":`, error.message);
    }
}

module.exports={
    checkLogs
}

