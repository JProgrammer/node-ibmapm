var http = require('http');
var https = require('https');
var url = require('url');
var fs = require('fs');
var HttpsProxyAgent = require('./https-proxy-agent');
var request = require('request');
var properties = require ("properties");

var log4js = require('log4js');

if(!process.env.KNJ_LOG_TO_FILE){
    log4js.loadAppender('console');
}else{
    log4js.loadAppender('file');
    log4js.addAppender(log4js.appenders.file('nodejs_restclient.log'), 'knj_restclient_log');
}

var logger =log4js.getLogger('knj_restclient_log');
var loglevel = process.env.KNJ_LOG_LEVEL;
if(loglevel && 
    (loglevel == "off" || loglevel == "error" || loglevel ==  "info" 
        || loglevel == "debug" || loglevel == "all")){
    logger.setLevel(process.env.KNJ_LOG_LEVEL.toUpperCase());
}else {
    logger.setLevel('INFO');
}

exports.proxyAgent = false;
exports.httpProxy = undefined;

exports.BM_info = {

};

exports.data_sender = function(options, isHttp, data){
    
    logger.debug("sending",options.host,options.port,options.path,options.method,JSON.stringify(options.headers));
    logger.debug("data",data);

    if(!isHttp){
        options.agent = exports.proxyAgent;
    }
    //console.info('sending',options.hostname, options.path, options.servername);
    var sendmethod = (isHttp ? http : https);
    options.rejectUnauthorized = false;
    if(isHttp && exports.httpProxy){
        var theProxy = exports.httpProxy;
        try{
            theProxy.post('http://'+options.hostname+':'+options.port+options.path, {
                body: data,//JSON.stringify(data),
                headers:options.headers
            },function (err, resp, body) {
                if(err){
                    logger.error(err);
                }
                if(resp){
                    logger.info("tool/sender.data_sender through proxy response statusCode: " + resp.statusCode);
                }
            });
        }catch(e){
            logger.error(e.message);
            logger.error(e.stack);
        }
    }else{
        try {
            var req = sendmethod.request(options, function(res) {

                //console.info('in req:',options.hostname, options.path);
                logger.info("tool/sender.data_sender response statusCode: " + res.statusCode);
                res.setEncoding('utf8');
                res.on('data', function(d) {
                    //console.info('on data:',options.hostname, options.path);
                    logger.debug('tool/sender.data_sender response: ' + d.toString());
                });
                
                res.on('error', function(error) {
                    //console.info('on err:',options.hostname, options.path);
                    logger.error('tool/sender.data_sender response error: ' + error);
                });
            });

            req.on('error', function(error) {
                //console.info('on req error:',options.hostname, options.path);
                logger.error('tool/sender.data_sender request error: ' + error);
            });

            req.write(data);
            req.end();
        } catch (e){
            //console.info('data_sender failed options:',options);
            logger.error(e.message);
            logger.error(e.stack);
        }
    }
};

exports.proxy_it = function(options, isHttp){
    if(process.env.APM_GW_PROXY_CONNECTION){
        if(isHttp){
            logger.info('get proxy for http request');
            // var proxy_options = url.parse(process.env.APM_GW_PROXY_CONNECTION);
            // options.path = 'http://'+options.hostname+':'+options.port+options.path;
            // options.host = proxy_options.host;
            // options.hostname = proxy_options.hostname;
            // options.port = proxy_options.port;
            // options.auth = proxy_options.auth;
            exports.httpProxy = request.defaults({proxy:process.env.APM_GW_PROXY_CONNECTION});
        }else if(!exports.proxyAgent){
            logger.info('get proxy for https request');
            var host_port = (process.env.APM_GW_PROXY_CONNECTION).split(':');
            exports.proxyAgent = new HttpsProxyAgent(process.env.APM_GW_PROXY_CONNECTION);
            options.agent = exports.proxyAgent;
        }
    }
};

exports.BM_info_generator = function(){
    var urlbase = "";
    var global_obj;
    if(exports.BM_info.done){
        return exports.BM_info;
    }

    //get target server URL
    if(process.env.APM_BM_SECURE_GATEWAY){
        urlbase = 'https://'+process.env.APM_BM_SECURE_GATEWAY;
        exports.BM_info.done = true;
        exports.BM_info.port = 443;
    }else if(process.env.MONITORING_SERVER_URL || process.env.APM_BM_GATEWAY_URL){
        urlbase = process.env.MONITORING_SERVER_URL || process.env.APM_BM_GATEWAY_URL;
        var option=url.parse(urlbase);
        if(option.protocol == 'http:'){
            exports.BM_info.done = true;
            exports.BM_info.port = 80;
        }else{
            exports.BM_info.port = 443;
        }
    }else {
        try{
            var global_string = fs.readFileSync(__dirname + '/../../etc/global.environment');

            global_obj = properties.parse(global_string.toString(),
                            {
                                separators:'=',
                                comments: [";", "@", "#"]
                            });
            if(global_obj.APM_BM_GATEWAY_URL){
                var urlbase = global_obj.APM_BM_GATEWAY_URL;
                process.env.APM_BM_GATEWAY_URL = urlbase;
                if(global_obj.APM_SNI){
                    process.env.APM_SNI = global_obj.APM_SNI;
                }
                var option=url.parse(urlbase);
                if(option.protocol == 'http:'){
                    exports.BM_info.done = true;
                    exports.BM_info.port = 80;
                }else{
                    exports.BM_info.port = 443;
                }
            }
        }catch(e){
            logger.error('Cannot get target server url either from etc/global.environment, etc/config.properties or from environment variables.');
        }
    }
    exports.BM_info.resource_url = urlbase + "/OEReceiver/v1/monitoringdata";
    exports.BM_info.deepdive_url = urlbase + "/1.0/monitoring/data";
    //get target server URL done
    //get credential
    if(!exports.BM_info.done){
        if(process.env.APM_KEYFILE){
            
            exports.BM_info.pfx = new Buffer(process.env.APM_KEYFILE, 'base64');
            exports.BM_info.passphrase = process.env.APM_KEYFILE_PSWD;
            exports.BM_info.done = true;
         }else if(process.env.APM_KEYFILE_URL){

            try{
                var global_string = fs.readFileSync(__dirname + '/../../etc/global.environment');

                global_obj = properties.parse(global_string.toString(),
                                {
                                    separators:'=',
                                    comments: [";", "@", "#"]
                                });
                if(!process.env.APM_KEYFILE_PSWD){
                    if(global_obj.APM_KEYFILE_PSWD){
                        process.env.APM_KEYFILE_PSWD = global_obj.APM_KEYFILE_PSWD;
                    }else{
                        logger.info('Cannot get APM_KEYFILE_PSWD either from etc/global.environment or from environment variables, use default value.');
                        process.env.APM_KEYFILE_PSWD = 'ccmR0cKs!';
                    }
                }
            }catch(e){
                logger.info('Cannot get APM_KEYFILE_PSWD either from etc/global.environment or from environment variables, use default value.');
                process.env.APM_KEYFILE_PSWD = 'ccmR0cKs!';
            }

            exports.BM_info.passphrase = process.env.APM_KEYFILE_PSWD;
            var info = exports.BM_info;
            var keyfile_options = url.parse(process.env.APM_KEYFILE_URL);
            var sendmethod = (keyfile_options.protocol=='http:' ? http : https);
            var count = 0;
            var req = sendmethod.request(keyfile_options, function(res){
                res.on('data', function(d) {
                    //logger.info(JsonSender response: ' + d);
                    if(!info.pfx){
                        info.pfx = d;    
                    }else{
                        info.pfx = Buffer.concat([info.pfx,d],info.pfx.length+d.length);
                    }
                    info.done = true;
                });
                            
                res.on('error', function(error) {
                    logger.error('JsonSender response error: ' + error);
                });
            });
            req.on('error', function(error) {
                logger.error('JsonSender request error: ' + error);
            });
            req.end();
        }else{
            try{
                if(!global_obj){
                    try{
                        var global_string = fs.readFileSync(__dirname + '/../../etc/global.environment');

                        global_obj = properties.parse(global_string.toString(),
                                        {
                                            separators:'=',
                                            comments: [";", "@", "#"]
                                        });
                    }catch(e){
                        logger.error('failed to read etc/global.environment');
                        var buff = fs.readFileSync(__dirname + '/../key.pkcs12');
                    
                        exports.BM_info.pfx = buff;
                        exports.BM_info.passphrase = process.env.APM_KEYFILE_PSWD?process.env.APM_KEYFILE_PSWD:'ccmR0cKs!';
                        exports.BM_info.done = true;
                    }
                }
                if(global_obj){
                    if(global_obj.APM_KEYFILE_PSWD){
                        exports.BM_info.passphrase = process.env.APM_KEYFILE_PSWD || global_obj.APM_KEYFILE_PSWD;
                    }else{
                        exports.BM_info.passphrase = process.env.APM_KEYFILE_PSWD || 'ccmR0cKs!';
                    }

                    if(global_obj.APM_KEYFILE){
                        var buff = fs.readFileSync(__dirname + '/../../etc/'+global_obj.APM_KEYFILE);
                        exports.BM_info.pfx = buff;
                        exports.BM_info.passphrase = exports.BM_info.passphrase || 'ccmR0cKs!';
                        exports.BM_info.done = true;
                    }else{
                        var buff = fs.readFileSync(__dirname + '/../../etc/'+keyfile.p12);
                        exports.BM_info.pfx = buff;
                        exports.BM_info.passphrase = exports.BM_info.passphrase || 'ccmR0cKs!';
                        exports.BM_info.done = true;
                    }
                }
            }catch(e){
                logger.error('Failed to get keyfile, no data will be sent until keyfile is find.');
                logger.info(e);
            }
        }
    }
    //get credential done
};