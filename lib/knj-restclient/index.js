// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: ibmapm
// This file is licensed under the Apache License 2.0.
// License text available at https://opensource.org/licenses/Apache-2.0

var fs = require('fs');
var senderQueue = require('./sender-queue');
var log4js = require('log4js');

if (!process.env.KNJ_LOG_TO_FILE) {
    log4js.loadAppender('console');
} else {
    log4js.loadAppender('file');
    log4js.addAppender(log4js.appenders.file('nodejs_restclient.log'), 'knj_restclient_log');
}

var logger =log4js.getLogger('knj_restclient_log');
var loglevel = process.env.KNJ_LOG_LEVEL;
if (loglevel && 
  (loglevel == "off" || loglevel == "error" || loglevel ==  "info" ||
    loglevel == "debug" || loglevel == "all")){
  logger.setLevel(process.env.KNJ_LOG_LEVEL.toUpperCase());
} else {
  logger.setLevel('INFO');
}


var queue = senderQueue.getQueue("bam");
var cfg = {
//    ingressURL : undefined,
    tenantID : "6defb2b3-4e44-463b-9731-09c64e7fdb67",
    metrics: "metric",
    AAR: "aar/middleware",
    ADR: "adr/middleware"
};

var dcId = undefined; //string
var resourceEntities = {}; //{<resourceid>:<entityid>, ...}
var relationships = {};    //{<resourceid>:[{type:<linktype>,to:<toresourceid>}], ...}
var intervalHandlers = {};//{<resourceid>:<interval>, ...}

module.exports.setConfiguration = function(fileName){
    var tempCfg;
    var file = process.env.KNJ_CONFIG_FILE || fileName;
    try {
        var confString = fs.readFileSync(file, 'utf8');
        tempCfg = JSON.parse(confString);
        cfg = tempCfg;
        if(!cfg.metrics){
            cfg.metrics = 'metric';
        }
        if(!cfg.AAR){
            cfg.AAR = 'aar/middleware';
        }
        if(!cfg.ADR){
            cfg.ADR = 'adr/middleware';
        }
        if(cfg.proxy){
            process.env.KNJ_PROXY = cfg.proxy;
        }
    } catch (e) {
        logger.error("register_topology set cofniguration failed.");
        logger.error(e);
    }
};
module.exports.getConfiguration = function(){
    return cfg;
};


module.exports._writeRegistryToFile = function(){
    try {
        var filename = "./"+dcId+".json";
        var fileContent = JSON.stringify({
                'resourceEntities': resourceEntities,
                'relationships': relationships
        });
        fs.writeFileSync(filename,fileContent,'utf8');
    } catch (e) {
        logger.error("write registry to file failed");
        logger.error(e);
    }
};

module.exports._readRegistryFromFile = function(){
    try {
        var filename = "./"+dcId+".json";
        var fileContent = fs.readFileSync(filename,'utf8');
        var jsonContent = JSON.parse(fileContent);
        resourceEntities = jsonContent.resourceEntities;
        relationships = jsonContent.relationships;
        return jsonContent;
    } catch (e) {
        logger.error("read registry to file failed");
        logger.error(e);
    }
};

module.exports.registerDC = function(obj, callback) {
    var payload = {
            resourceID: obj.id,    
            type: obj.type,
            properties:{
                displayLabel: obj.displayLabel || 'Unknown',
                startTime: obj.startTime || (new Date()).toISOString(), //'2016-05-27T03:21:25.432Z'
                sourceDomain: process.env.VCAP_APPLICATION?'bluemix':'on-prem',
                status: 'normal'        //need to be dynamic
            },
            origin: obj.id,
            tenant: cfg.tenantID
    };
    if(obj.references && obj.references.length > 0){
        var references={};
        for(var ref in obj.references){
            var item = obj.references[ref];
            if(!references[item.type]){
                references[item.type] = [];
            }
            if(item.nodetype){
                res={};
                res[item.direction] = {resourceId:{name:item.id, nodetype:item.nodetype}};
                references[item.type].push(res);
            }else{
                res={};
                res[item.direction] = item.id;
                references[item.type].push(res);
            }
        }
        payload["references"] = references;
    }
    for(var prop in obj.properties){    //merge properties
        payload.properties[prop] = obj.properties[prop];
    }
    dcId = obj.id;
    //TODO add: module.exports._readRegistryFromFile();
    if(!cfg.ingressURL){
    	logger.error('No ingress URL is set, please set "ingressURL" in your configuration json file');
    	return;
    }
    queue.addTask({
        url: cfg.ingressURL+"?tenant="+cfg.tenantID+"&origin="+dcId+"&namespace=&type=providers",
        payload: payload,
        type: 'dc',
        additionalHeader: {'X-TenantID': cfg.tenantID},
        callback: function(err,res){
            if(err){
                logger.error(err);
                if(callback){
                    callback(err);
                }
                return;
            }
            if(callback){
                callback(null, res);
            }
        }
    });
};

module.exports.registerResource = function(obj, callback) {
    if(!obj.type || !obj.id || !obj.properties){
        logger.error("registerResource payload is not complete, must have: id, type and properties");
        return;
    }
    var payload = {                        //merge public attributes
            resourceID: obj.id,
            type: obj.type,
            startTime: obj.startTime || (new Date()).toISOString(),
            properties: {
                displayLabel: obj.displayLabel || 'Unknown',
                startTime: obj.startTime || (new Date()).toISOString(), //'2016-05-27T03:21:25.432Z'
                sourceDomain: process.env.VCAP_APPLICATION?'bluemix':'on-prem',
                status: 'normal'        //need to be dynamic
            },
            origin: dcId,
            tenant: cfg.tenantID
    };

    if(obj.references && obj.references.length > 0){
        var references={};
        for(var ref in obj.references){
            var item = obj.references[ref];
            if(!references[item.type]){
                references[item.type] = [];
            }
            if(item.nodetype){
                res={};
                res[item.direction] = {resourceId:{name:item.id, nodetype:item.nodetype}};
                references[item.type].push(res);
            }else{
                res={};
                res[item.direction] = item.id;
                references[item.type].push(res);
            }
        }
        payload["references"] = references;
    }
    for(var prop in obj.properties){    //merge properties
        payload.properties[prop] = obj.properties[prop];
    }
    if(!cfg.ingressURL){
    	logger.error('No ingress URL is set, please set "ingressURL" in your configuration json file');
    	return;
    }
    queue.addTask({
        url: cfg.ingressURL+"?tenant="+cfg.tenantID+"&origin="+dcId+"&namespace=&type=resources",
        payload: payload,
        type: 'resources: '+payload.type,
        additionalHeader:{'X-TenantID': cfg.tenantID},
        callback: function(err, res){
            if(err){
                logger.error(err);
                if(callback){
                    callback(err);
                }
                return;
            }
            if(callback){
                callback(null, res);
            }
        }
    });
};

function transferTimezoneToString(zone){
    var result = "";
    if(zone > 0){
        result += "-";
    }else{
        result += "+";
    }
    var pureZone = Math.abs(zone);
    var intZone = Math.floor(pureZone);
    if(intZone>=10){
        result += (intZone+":");
    }else{
        result += ("0"+intZone+":");
    }

    if(pureZone - intZone){
        result += "30";
    }else{
        result += "00";
    }
    return result;
}

module.exports.sendMetrics = function(payload, callback){
    if(!payload.resourceID || !payload.dimensions || !payload.metrics){
        logger.warn("sendMetrics payload is not complete, must have: resourceID, dimensions and metrics");
        return;
    }
    if(payload){
        payload.timestamp = (new Date()).toISOString();
    }
    if(!cfg.ingressURL){
    	logger.error('No ingress URL is set, please set "ingressURL" in your configuration json file');
    	return;
    }
    queue.addTask({
        url: cfg.ingressURL+"?type="+cfg.metrics+"&tenant="+cfg.tenantID+"&origin="+dcId,
        payload: payload,
        type: 'metrics: '+payload.dimensions.name,
        additionalHeader: {'X-TenantID': cfg.tenantID},
        callback: callback
    });
}

module.exports.sendAAR = function(payload, callback){
    if(!payload.properties || !payload.metrics ){
        logger.error("sendAAR payload is not complete, must have: properties and metrics");
        return;
    }
    if(!dcId){
        callback({message:"dcId is not ready"});
    }else{
        payload.properties['originID'] = dcId;
        payload.properties['tenantID'] = cfg.tenantID;
        if(!cfg.ingressURL){
	    	logger.error('No ingress URL is set, please set "ingressURL" in your configuration json file');
	    	return;
	    }
        queue.addTask({
            url: cfg.ingressURL+"?type="+cfg.AAR+"&tenant="+cfg.tenantID+"&origin="+dcId, 
            payload: payload,
            type: 'aar: '+payload.properties.requestName,
            additionalHeader: {'X-TenantID': cfg.tenantID},
            callback: callback
        });
    }
}

module.exports.sendADR = function(payload, callback){
    if(!payload.properties || !payload.statistics ){
        logger.error("sendADR payload is not complete, must have: properties and statistics");
        return;
    }
    if(!dcId){
        callback({message:"dcId is not ready"});
    }else{
        payload.properties['originID'] = dcId;
        payload.properties['tenantID'] = cfg.tenantID;
        if(!cfg.ingressURL){
	    	logger.error('No ingress URL is set, please set "ingressURL" in your configuration json file');
	    	return;
	    }
        queue.addTask({
            url: cfg.ingressURL+"?type="+cfg.ADR+"&tenant="+cfg.tenantID+"&origin="+dcId, 
            payload: payload,
            type: 'adr: '+payload.properties.reqName,
            additionalHeader: {'X-TenantID': cfg.tenantID},
            callback: callback
        });
    }
}