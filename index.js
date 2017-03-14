// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: ibmapm
// This file is licensed under the Apache License 2.0.
// License text available at https://opensource.org/licenses/Apache-2.0

var log4js = require('log4js');
var properties = require('properties');
var fs = require('fs');
var path = require('path');

//    initialize log
if (!process.env.KNJ_LOG_TO_FILE) {
    log4js.loadAppender('console');
} else {
    log4js.loadAppender('file');
    log4js.addAppender(log4js.appenders.file('nodejs_dc.log'), 'knj_log');
}

var logger = log4js.getLogger('knj_log');
var loglevel = process.env.KNJ_LOG_LEVEL;
if (loglevel &&
        (loglevel === 'off' || loglevel === 'error' || loglevel === 'info' ||
                loglevel === 'debug' || loglevel === 'all')) {
    logger.setLevel(process.env.KNJ_LOG_LEVEL.toUpperCase());
} else {
    logger.setLevel('INFO');
}

//    initialize log end

//    initialize different code path - BI/BAM/Agent
var configObj;
if (!process.env.MONITORING_SERVER_TYPE) {
    try {
        var configString = fs.readFileSync(path.join(__dirname, '/etc/config.properties'));

        configObj = properties.parse(configString.toString(),
            {
                separators: '=',
                comments: [';', '@', '#']
            });
        process.env.MONITORING_SERVER_TYPE = configObj.MONITORING_SERVER_TYPE;
    } catch (e) {
        logger.error('Failed to read etc/config.properties, use default MONITORING_SERVER_TYPE: BAM');
        logger.info(e);
        process.env.MONITORING_SERVER_TYPE = 'BAM';
    }
}

if (!process.env.MONITORING_SERVER_URL && configObj && configObj.MONITORING_SERVER_URL) {
    process.env.MONITORING_SERVER_URL = configObj.MONITORING_SERVER_URL;
}
if (!process.env.MONITORING_APPLICATION_NAME && configObj && configObj.MONITORING_APPLICATION_NAME) {
    process.env.MONITORING_APPLICATION_NAME = configObj.MONITORING_APPLICATION_NAME;
}
if (!process.env.MONITORING_SECURITY_URL && configObj && configObj.MONITORING_SECURITY_URL) {
    process.env.MONITORING_SECURITY_URL = configObj.MONITORING_SECURITY_URL;
}
if (!process.env.MONITORING_SERVER_NAME && configObj && configObj.MONITORING_SERVER_NAME) {
    process.env.MONITORING_SERVER_NAME = configObj.MONITORING_SERVER_NAME;
}

if (process.env.MONITORING_SECURITY_URL) {
    process.env.APM_KEYFILE_URL = process.env.MONITORING_SECURITY_URL;
}

//    shared configurations:

if (typeof(process.env.KNJ_ENABLE_TT) === 'undefined' && configObj && configObj.KNJ_ENABLE_TT) {
    process.env.KNJ_ENABLE_TT = configObj.KNJ_ENABLE_TT;
}

if (!process.env.KNJ_LOG_LEVEL && configObj && configObj.KNJ_LOG_LEVEL) {
    process.env.KNJ_LOG_LEVEL = configObj.KNJ_LOG_LEVEL;
}

if (typeof(process.env.KNJ_SAMPLING) === 'undefined' && configObj && configObj.KNJ_SAMPLING) {
    process.env.KNJ_SAMPLING = configObj.KNJ_SAMPLING;
}

if (typeof(process.env.KNJ_MIN_CLOCK_TRACE) === 'undefined' && configObj && configObj.KNJ_MIN_CLOCK_TRACE) {
    process.env.KNJ_MIN_CLOCK_TRACE = configObj.KNJ_MIN_CLOCK_TRACE;
}

if (typeof(process.env.KNJ_MIN_CLOCK_STACK) === 'undefined' && configObj && configObj.KNJ_MIN_CLOCK_STACK) {
    process.env.KNJ_MIN_CLOCK_STACK = configObj.KNJ_MIN_CLOCK_STACK;
}

// initialize different code path - BI/BAM/Agent end

var plugin = require('./lib/plugin.js').monitoringPlugin;
switch (process.env.MONITORING_SERVER_TYPE) {
case 'BAM':
    plugin.init('Cloudnative');
    break;
case 'BI':
    plugin.init('CloudOE'); //    for M&A
    break;
case 'Agent':
    plugin.init('SaaS');    //    for SaaS
    break;
default:
    plugin.init('Cloudnative');
}
