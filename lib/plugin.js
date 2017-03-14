var metricManager = require('./metric-manager.js').metricManager;
var config = require('./config.js');
var fs = require('fs');

// initialize configuration - begin
var cfg = config.init();
var requestConfig = {
    minClockTrace : cfg.deepDive.minClockTrace,
    minCpuTrace : cfg.deepDive.minCpuTrace,
    minCpuStack : cfg.deepDive.minCpuStack,
    minClockStack : cfg.deepDive.minClockStack
};

// try {
// var probesString=fs.readFileSync( "./knj_probes.json", 'utf8' );
// config.setMethodProbes(JSON.parse(probesString));
// }catch(e){
// console.info('You are not assigning exclude_modules by knj_probes.json.');
// console.info('Format is: {"exclude_modules":["module1","module2", ...]}');
// config.setMethodProbes({
// "include_modules":[],
// "exclude_modules":[]
// });
// }

// initialize configuration - end

var requestManager = require('./request-manager.js').requestManager;
var healthcenter = global.APPMETRICS = global.APPMETRICS || require('appmetrics');

var MAServiceName = 'MonitoringAndAnalytics';
if (process.env.APM_MONITORING_SERVICE_NAME) {
    MAServiceName = process.env.APM_MONITORING_SERVICE_NAME;
}

function testTrue(v){
    if(v && ['false','False','FALSE', ''].indexOf(v) < 0){
        return true;
    }else {
        return false;
    }
};

var MonitoringPlugin = function() {

};

MonitoringPlugin.prototype.init = function(envType) {
    process.env.KNJ_ENVTYPE = envType;

    metricManager.start(envType);

    if(testTrue(process.env.KNJ_ENABLE_PROFILING)){ // enable profiling based on user's environment variables
        healthcenter.enable('profiling');
    }
    
    if (envType === 'SaaS') {   // for Saas/onPremise
        if (testTrue(process.env.KNJ_ENABLE_DEEPDIVE)) {
            process.env.KNJ_ENABLE_DEEPDIVE = true;
            healthcenter.enable('requests', requestConfig);
            if (testTrue(process.env.KNJ_ENABLE_METHODTRACE)) {
                process.env.KNJ_ENABLE_METHODTRACE = true;
                healthcenter.enable('trace');
            }
        }
        if (typeof (cfg.deepDive.filters) !== 'undefined') {
            healthcenter.setConfig('http', cfg.filters);
        }
        if (process.env.KNJ_ENABLE_DEEPDIVE) {
            requestManager.start(envType);
        }
    } else {    // for Bluemix & Cloudnative
        if (process.env.APM_BM_SECURE_GATEWAY || process.env.APM_BM_GATEWAY_URL || process.env.MONITORING_SERVER_TYPE == 'BI') {    //Bluemix
            process.env.KNJ_ENABLE_DEEPDIVE = true;
            healthcenter.enable('requests', requestConfig);
            //healthcenter.enable('trace');
            if(!testTrue(process.env.KNJ_DISABLE_METHODTRACE)){
                process.env.KNJ_ENABLE_METHODTRACE = true;
                healthcenter.enable('trace');
            }
            requestManager.start(envType);
            if(testTrue(process.env.KNJ_ENABLE_TT)){
                process.env.KNJ_ENABLE_TT=true;
            }
        } else if (process.env.VCAP_SERVICES
                && (JSON.parse(process.env.VCAP_SERVICES)[MAServiceName] && JSON
                        .parse(process.env.VCAP_SERVICES)[MAServiceName][0].credentials.service_plan
                        .indexOf('DeepDive-IBM-APM-Monitoring-Analytics-') == 0)) { //Bluemix
            healthcenter.enable('requests', requestConfig);
            process.env.KNJ_ENABLE_DEEPDIVE = true;
            if(!testTrue(process.env.KNJ_DISABLE_METHODTRACE)){
                healthcenter.enable('trace');
                process.env.KNJ_ENABLE_METHODTRACE = true;
            }
            requestManager.start(envType);
        } else {
            if (testTrue(process.env.KNJ_ENABLE_METHODTRACE)){
                process.env.KNJ_ENABLE_DEEPDIVE = true;
                process.env.KNJ_ENABLE_METHODTRACE = true;
                healthcenter.enable('requests', requestConfig);
                healthcenter.enable('trace');
                requestManager.start(envType);
                if(testTrue(process.env.KNJ_ENABLE_TT)){
                    process.env.KNJ_ENABLE_TT = true;
                }
            } else if(testTrue(process.env.KNJ_ENABLE_DEEPDIVE)){
                process.env.KNJ_ENABLE_DEEPDIVE = true;
                healthcenter.enable('requests', requestConfig);
                requestManager.start(envType);
                if(testTrue(process.env.KNJ_ENABLE_TT)){
                    process.env.KNJ_ENABLE_TT = true;
                }
            }else if(testTrue(process.env.KNJ_ENABLE_TT)){
                console.info('enable TT');
                process.env.KNJ_ENABLE_TT = true;
                //TODO, need a more detailed enable level, DB only
                healthcenter.enable('requests', requestConfig);
                healthcenter.enable('trace');
                requestManager.start(envType);
            }
        }
    }
    config.update(cfg);
};

exports.monitoringPlugin = new MonitoringPlugin();
