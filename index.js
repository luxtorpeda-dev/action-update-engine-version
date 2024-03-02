const core = require('@actions/core');
const { context, GitHub } = require('@actions/github');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const { Octokit, App } = require("octokit");

const packagesEnginesPath = 'engines';

console.log('Starting.');

async function run() {
    try {
        const engineName = core.getInput('engineName');
        const newTag = core.getInput('newTag');
        const envJsonPath = path.join(packagesEnginesPath, engineName, 'env.json');

        const envJsonStr = await fs.readFile(envJsonPath, 'utf-8');
        const envData = JSON.parse(envJsonStr);
        envData.COMMIT_TAG = newTag;
        await fs.writeFile(envJsonPath, JSON.stringify(envData, null, 4));

        const packagesJsonPath = path.join('metadata', 'packagessniper_v2.json');
        const packagesJsonStr = await fs.readFile(packagesJsonPath, 'utf-8');
        const packagesJson = JSON.parse(packagesJsonStr);

        for(let engineData of packagesJson.engines) {
            if(engineData.internal_engine_name === engineName) {
                engineData.version = newTag;
            }
        }

        await fs.writeFile(packagesJsonPath, JSON.stringify(packagesJson, null, 4));
    }
    catch (error) {
        core.setFailed(error.message);
    }
}

run();
