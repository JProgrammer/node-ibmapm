'use strict';
var fs = require('fs');
var os = require('os');
var crypto = require('crypto');
var logger = require('./logutil').getLogger('util.js');
var path = require('path');
var k8sutil = require('../tools/k8sutil');

const MAX_NAME_LENGTH = 19;
const MAX_MSN_LENGTH = 25;
var appGuid;
var applicationName = process.env.APPLICATION_NAME;
var appHostname = os.hostname();
var inited = false;

module.exports.init = function() {
    let rootPath = process.cwd();
    if (inited) {
        return;
    }
    if (process.env.VCAP_APPLICATION) {
        let vcapapp = JSON.parse(process.env.VCAP_APPLICATION);
        appGuid = vcapapp.application_id;
        applicationName = process.env.APPLICATION_NAME || vcapapp.application_name;

    } else {
        initAppGuid(rootPath);
    }
    appGuid = genAppGuid(appGuid, applicationName);

    inited = true;
};

function genAppGuid(guid, appName) {
    logger.debug('util.js', 'appGuidDec', guid, appName);
    let retAppGuid = guid;
    let pref = appName.replace(/\//g, '_');
    pref = pref.replace('-', '');

    if (k8sutil.isICP()) {
        pref = pref + '_' + k8sutil.getNamespace() + '_' + k8sutil.getPodName();
        retAppGuid = crypto.createHash('md5').update(pref).digest('hex');
    }
    if (pref.length > MAX_NAME_LENGTH) {
        pref = pref.substr(0, MAX_NAME_LENGTH);
    }
    retAppGuid = pref + '_' + retAppGuid;
    if (retAppGuid.length > MAX_MSN_LENGTH) {
        retAppGuid = retAppGuid.substr(0, MAX_MSN_LENGTH);
    }
    return retAppGuid;
};

module.exports.getAppGuid = function() {
    return appGuid;
};

module.exports.getApplicationName = function() {
    return applicationName;
};

module.exports.validateBIPayload = function(payload) {
    let BIRequiredKeys = ['SUBNODE_TYPE', 'APP_GUID', 'APP_NAME', 'INSTANCE_ID', 'INSTANCE_INDEX',
        'URI', 'START_TIME', 'APP_PORT', 'APP_ENTRY', 'PORT', 'PID', 'CPU_P', 'MEM_RSS',
        'TYPE', 'UPTIME', 'REQRATE', 'RESP_TIME', 'MAX_RSPTIME', 'app_memAll', 'app_uptime',
        'gc_heapSize', 'gc_heapUsed', 'gc_duration', 'gc_mCount', 'gc_sCount', 'eventloop_time',
        'eventloop_latencyMin', 'eventloop_latencyMax', 'eventloop_latencyAvg', 'loop_count',
        'loop_minimum', 'loop_maximum', 'loop_average', 'HTTP_REQ'
    ];
    BIRequiredKeys.forEach(function(curr) {
        if (payload[curr] === undefined || payload[curr] === null) {
            return false;
        }
    });
    return true;
};

function generateAppNameByPackage() {
    let name;
    for (let i in process.mainModule.paths) {
        let packageFile = process.mainModule.paths[i].split('node_modules')[0] +
            '/' + 'package.json';
        try {

            let packageString = fs.readFileSync(packageFile);
            let packageJson = JSON.parse(packageString);
            if (packageJson.name) {
                name = packageJson.name;
                break;
            }
        } catch (e) {
            logger.debug(e.message);
        }
    }
    return name;
};

function generateApplicationNameAndGuidbyPath(rootPath) {
    let thePath = rootPath;
    let theFolder = thePath.replace(/\//g, '_');
    let argStr = process.argv[1].replace(/\//g, '_');
    // generating appGuid
    let appGuidMd5OriginStr = os.hostname() + '_' + theFolder + '_' + argStr;
    let appGuidMd5Str = crypto.createHash('md5').update(appGuidMd5OriginStr).digest('hex');
    appGuid = appGuidMd5Str.substring(0, Math.min(25, appGuidMd5Str.length));
    // generating appGuid end
    if (process.argv[1].indexOf(thePath) !== -1)
        applicationName = applicationName || process.argv[1];
    else
        applicationName = applicationName || path.join(thePath, process.argv[1]);
};

function initAppGuid(rootPath) {
    if (!process.env.APPLICATION_NAME) {
        // find name in package.json
        if (process.mainModule.paths && process.mainModule.paths.length > 0) {
            let name = generateAppNameByPackage();
            if (!name) {
                logger.warn('Failed to get name in package.json,' +
                    ' will generate applicationName and' +
                    ' APP_GUID by file position.');
                generateApplicationNameAndGuidbyPath(rootPath);
            } else {
                appGuid = appHostname + '_' + name.replace('-', '');
                applicationName = name;
            }
        } else {
            generateApplicationNameAndGuidbyPath(rootPath);
        }

    } else {
        applicationName = process.env.APPLICATION_NAME;
        appGuid = appHostname + '_' +
            process.env.APPLICATION_NAME;
    }


};
