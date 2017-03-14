var fs = require("fs");
var zlib = require("zlib");
var mm = require("./metric-manager.js").metricManager;
var os = require("os");
var config = require("./config.js");
var http = require('http');
var https= require('https');
var util = require('util');
var url= require('url');
var adaptor = require('./encode/diagAdaptor');
var reqManager = require('./request-manager.js');
var senderTool = require('./tool/sender');

var log4js = require('log4js');
var logger =log4js.getLogger('knj_log');

var cfg = config.getConfig();
var cfgDeepDive = cfg.deepDive;




// request types
function RequestType(id, name) {
    this.id = id;
    this.name = name;
}

function getCurrTime() {
    return (new Date()).getTime();
}
var dummy = function() {};

exports.http = new RequestType(1, "HTTP");
exports.db = new RequestType(21, "DB");
exports.fs = new RequestType(22, "FS");

var requestTypes = [exports.http, exports.db, exports.fs];
var requestStringToTypes = {"HTTP":exports.http, "DB":exports.db, "FS":exports.fs, "HTTP Outbound":exports.http};

// JSO structures

function reqDictionaryEntry(id, req) {
    return {
        cid: 10,
        id: id,
        req: req
    }
}

function consumerStatus(af) {
    return {
        cid: 1,
        af: af
    }
}

// {"cid":2,"ci":[
//   {"cid":3,"key":"lurl","vt":"java.lang.String","val":"corbaloc:rir:\/NameServiceServerRoot"},
//   {"cid":3,"key":"requestType","vt":"java.lang.String","val":"JNDI"}]}
function contextDataGroup(ci) {
    return {
        cid: 2,
        ci: ci
    }
}

// {"cid":3,"key":"lurl","vt":"java.lang.String","val":"corbaloc:rir:\/NameServiceServerRoot"}
function contextDataItem(key, val) {
    return {
        cid: 3,
        key: key,
        vt: "java.lang.String",
        val: val
    }
}

//{"cid":4,"props":
//{"num.ear.files":"9","class.path":"C:\\ravi\\programs\\IBM\\Websphere80\\profiles\\dc72002\/properties;C:\\ravi\\programs\\IBM\\Websphere80\/properties;C:\\ravi\\programs\\IBM\\Websphere80\/lib\/startup.jar;C:\\ravi\\programs\\IBM\\Websphere80\/lib\/bootstrap.jar;C:\\ravi\\programs\\IBM\\Websphere80\/lib\/jsf-nls.jar;C:\\ravi\\programs\\IBM\\Websphere80\/lib\/lmproxy.jar;C:\\ravi\\programs\\IBM\\Websphere80\/lib\/urlprotocols.jar;C:\\ravi\\programs\\IBM\\Websphere80\/deploytool\/itp\/batchboot.jar;C:\\ravi\\programs\\IBM\\Websphere80\/deploytool\/itp\/batch2.jar;C:\\ravi\\programs\\IBM\\Websphere80\/java\/lib\/tools.jar","library.path":"C:\\ravi\\programs\\IBM\\Websphere80\/lib\/native\/win\/x86_64\/;C:\\ravi\\programs\\IBM\\Websphere80\\java\\jre\\bin\\default;C:\\ravi\\programs\\IBM\\Websphere80\\java\\jre\\bin;.;C:\\ravi\\programs\\IBM\\Websphere80\\lib\\native\\win\\x86_64;C:\\ravi\\programs\\IBM\\Websphere80\\bin;C:\\ravi\\programs\\IBM\\Websphere80\\java\\bin;C:\\ravi\\programs\\IBM\\Websphere80\\java\\jre\\bin;C:\\Perl64\\site\\bin;C:\\Perl64\\bin;C:\\Windows\\system32;C:\\Windows;C:\\Windows\\System32\\Wbem;C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\;C:\\Program Files\\IBM\\Infoprint Select;C:\\Program Files\\ThinkPad\\Bluetooth Software\\;C:\\Program Files\\ThinkPad\\Bluetooth Software\\syswow64;C:\\Program Files\\Broadcom\\WHL\\;C:\\Program Files\\Broadcom\\WHL\\syswow64;C:\\Program Files\\Broadcom\\WHL\\SysWow64\\;C:\\Program Files\\Broadcom\\WHL\\SysWow64\\syswow64;C:\\Program Files\\Intel\\WiFi\\bin\\;C:\\Program Files\\Common Files\\Intel\\WirelessCommon\\;C:\\Program Files (x86)\\Lenovo\\Access Connections\\;c:\\notes;c:\\notes;c:\\Program Files (x86)\\Microsoft SQL Server\\90\\Tools\\binn\\;C:\\Program Files (x86)\\Common Files\\Intuit\\QBPOSSDKRuntime;C:\\ravi\\programs\\DB2\\IBM\\SQLLIB\\BIN;C:\\ravi\\programs\\DB2\\IBM\\SQLLIB\\FUNCTION;C:\\ravi\\programs\\DB2\\IBM\\SQLLIB\\SAMPLES\\REPL;C:\\IBM\\ITM\\bin;C:\\IBM\\ITM\\TMAITM6;C:\\IBM\\ITM\\InstallITM;C:\\ravi\\programs\\jad158g.win;C:\\ravi\\programs\\IBM\\Websphere80\\java\\bin;C:\\ravi\\programs\\MicrosoftVisualStudio9.0\\VC\\lib;C:\\ravi\\programs\\MicrosoftVisualStudio9.0\\VC\\bin\\amd64;C:\\ravi\\programs\\MicrosoftVisualStudio9.0\\VC\\bin;C:\\Program Files (x86)\\PSPad editor;C:\\ravi\\programs\\IBM\\WebSphere85\\AppServer\\java\\bin;C:\\ravi\\work\\dev\\projects\\rtc_itcamad72;C:\\Program Files\\Intel\\WiFi\\bin\\;C:\\Program Files\\Common Files\\Intel\\WirelessCommon\\;","cpu.speed":"2192","host.name":"ibmwork","install.directory":"C:\\ravi\\programs\\IBM\\Websphere80\\profiles\\dc72002","java.vendor":"IBM Corporation","num.cpus":"8","cell.name":"ibmworkNode04Cell","num.cpus.online":"8","total.memory":"17057431552","os.name":"Windows 7","java.security.policy":"C:\\IBM\\ITM\\dchome\\7.2.0.0.2\\itcamdc\\etc\\datacollector.policy","java.home":"C:\\ravi\\programs\\IBM\\Websphere80\\java\\jre","java.command.line.arguments":"C:\\ravi\\programs\\IBM\\Websphere80\/java\/bin\/java -Declipse.security -Dwas.status.socket=63214 -Dosgi.install.area=C:\\ravi\\programs\\IBM\\Websphere80 -Dosgi.configuration.area=C:\\ravi\\programs\\IBM\\Websphere80\\profiles\\dc72002\/servers\/server1\/configuration -Dosgi.framework.extensions=com.ibm.cds,com.ibm.ws.eclipse.adaptors -Xshareclasses:name=webspherev80,nonFatal -Dsun.reflect.inflationThreshold=250 -Dwas.debug.mode=true -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=7781 -Xbootclasspath\/p:C:\\ravi\\programs\\IBM\\Websphere80\/lib\/dertrjrt.jar;C:\\ravi\\programs\\IBM\\Websphere80\/java\/jre\/lib\/ext\/ibmorb.jar;C:\\ravi\\programs\\IBM\\Websphere80\/java\/jre\/lib\/ext\/ibmext.jar;C:\\IBM\\ITM\\dchome\\7.2.0.0.2\/toolkit\/lib\/bcm-bootstrap.jar -Dorg.osgi.framework.bootdelegation=* -classpath C:\\ravi\\programs\\IBM\\Websphere80\\profiles\\dc72002\/properties;C:\\ravi\\programs\\IBM\\Websphere80\/properties;C:\\ravi\\programs\\IBM\\Websphere80\/lib\/startup.jar;C:\\ravi\\programs\\IBM\\Websphere80\/lib\/bootstrap.jar;C:\\ravi\\programs\\IBM\\Websphere80\/lib\/jsf-nls.jar;C:\\ravi\\programs\\IBM\\Websphere80\/lib\/lmproxy.jar;C:\\ravi\\programs\\IBM\\Websphere80\/lib\/urlprotocols.jar;C:\\ravi\\programs\\IBM\\Websphere80\/deploytool\/itp\/batchboot.jar;C:\\ravi\\programs\\IBM\\Websphere80\/deploytool\/itp\/batch2.jar;C:\\ravi\\programs\\IBM\\Websphere80\/java\/lib\/tools.jar -Dibm.websphere.internalClassAccessMode=allow -Xms50m -Xmx256m -Xcompressedrefs -Xscmaxaot4M -Xscmx60M -Dws.ext.dirs=C:\\ravi\\programs\\IBM\\Websphere80\/java\/lib;C:\\ravi\\programs\\IBM\\Websphere80\\profiles\\dc72002\/classes;C:\\ravi\\programs\\IBM\\Websphere80\/classes;C:\\ravi\\programs\\IBM\\Websphere80\/lib;C:\\ravi\\programs\\IBM\\Websphere80\/installedChannels;C:\\ravi\\programs\\IBM\\Websphere80\/lib\/ext;C:\\ravi\\programs\\IBM\\Websphere80\/web\/help;C:\\ravi\\programs\\IBM\\Websphere80\/deploytool\/itp\/plugins\/com.ibm.etools.ejbdeploy\/runtime -Dderby.system.home=C:\\ravi\\programs\\IBM\\Websphere80\/derby -Dcom.ibm.itp.location=C:\\ravi\\programs\\IBM\\Websphere80\/bin -Djava.util.logging.configureByServer=true -Duser.install.root=C:\\ravi\\programs\\IBM\\Websphere80\\profiles\\dc72002 -Djava.ext.dirs=C:\\ravi\\programs\\IBM\\Websphere80\/tivoli\/tam;C:\\ravi\\programs\\IBM\\Websphere80\/java\/jre\/lib\/ext -Djavax.management.builder.initial=com.ibm.ws.management.PlatformMBeanServerBuilder -Dpython.cachedir=C:\\ravi\\programs\\IBM\\Websphere80\\profiles\\dc72002\/temp\/cachedir -Dwas.install.root=C:\\ravi\\programs\\IBM\\Websphere80 -Djava.util.logging.manager=com.ibm.ws.bootstrap.WsLogManager -Dserver.root=C:\\ravi\\programs\\IBM\\Websphere80\\profiles\\dc72002 -Dcom.ibm.security.jgss.debug=off -Dcom.ibm.security.krb5.Krb5Debug=off -DTEMAGCCollector.gclog.path=None -Dam.home=C:\/IBM\/ITM\/dchome\/7.2.0.0.2\/itcamdc -Dcom.ibm.tivoli.itcam.toolkit.ai.runtimebuilder.enable.rebuild=true -agentlib:am_ibm_16=server1 -verbosegc -Dcom.ibm.tivoli.itcam.ai.runtimebuilder.inputs=C:\\IBM\\ITM\\dchome\\7.2.0.0.2\/runtime\/dc72002.ibmworkNode04Cell.ibmworkNode04.server1.DCManualInput.txt -Dsun.rmi.dgc.client.gcInterval=3600000 -Dsun.rmi.dgc.server.gcInterval=3600000 -Dsun.rmi.transport.connectionTimeout=300000 -Dws.bundle.metadata=C:\\IBM\\ITM\\dchome\\7.2.0.0.2\/runtime\/wsBundleMetaData -Dam.wascell=ibmworkNode04Cell -Dam.wasprofile=dc72002 -Dam.wasnode=ibmworkNode04 -Dam.wasserver=server1 -Djava.library.path=C:\\ravi\\programs\\IBM\\Websphere80\/lib\/native\/win\/x86_64\/;C:\\ravi\\programs\\IBM\\Websphere80\\java\\jre\\bin\\default;C:\\ravi\\programs\\IBM\\Websphere80\\java\\jre\\bin;.;C:\\ravi\\programs\\IBM\\Websphere80\\lib\\native\\win\\x86_64;C:\\ravi\\programs\\IBM\\Websphere80\\bin;C:\\ravi\\programs\\IBM\\Websphere80\\java\\bin;C:\\ravi\\programs\\IBM\\Websphere80\\java\\jre\\bin;C:\\Perl64\\site\\bin;C:\\Perl64\\bin;C:\\Windows\\system32;C:\\Windows;C:\\Windows\\System32\\Wbem;C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\;C:\\Program Files\\IBM\\Infoprint Select;C:\\Program Files\\ThinkPad\\Bluetooth Software\\;C:\\Program Files\\ThinkPad\\Bluetooth Software\\syswow64;C:\\Program Files\\Broadcom\\WHL\\;C:\\Program Files\\Broadcom\\WHL\\syswow64;C:\\Program Files\\Broadcom\\WHL\\SysWow64\\;C:\\Program Files\\Broadcom\\WHL\\SysWow64\\syswow64;C:\\Program Files\\Intel\\WiFi\\bin\\;C:\\Program Files\\Common Files\\Intel\\WirelessCommon\\;C:\\Program Files (x86)\\Lenovo\\Access Connections\\;c:\\notes;c:\\notes;c:\\Program Files (x86)\\Microsoft SQL Server\\90\\Tools\\binn\\;C:\\Program Files (x86)\\Common Files\\Intuit\\QBPOSSDKRuntime;C:\\ravi\\programs\\DB2\\IBM\\SQLLIB\\BIN;C:\\ravi\\programs\\DB2\\IBM\\SQLLIB\\FUNCTION;C:\\ravi\\programs\\DB2\\IBM\\SQLLIB\\SAMPLES\\REPL;C:\\IBM\\ITM\\bin;C:\\IBM\\ITM\\TMAITM6;C:\\IBM\\ITM\\InstallITM;C:\\ravi\\programs\\jad158g.win;C:\\ravi\\programs\\IBM\\Websphere80\\java\\bin;C:\\ravi\\programs\\MicrosoftVisualStudio9.0\\VC\\lib;C:\\ravi\\programs\\MicrosoftVisualStudio9.0\\VC\\bin\\amd64;C:\\ravi\\programs\\MicrosoftVisualStudio9.0\\VC\\bin;C:\\Program Files (x86)\\PSPad editor;C:\\ravi\\programs\\IBM\\WebSphere85\\AppServer\\java\\bin;C:\\ravi\\work\\dev\\projects\\rtc_itcamad72;C:\\Program Files\\Intel\\WiFi\\bin\\;C:\\Program Files\\Common Files\\Intel\\WirelessCommon\\; -Djava.endorsed.dirs=C:\\ravi\\programs\\IBM\\Websphere80\/endorsed_apis;C:\\ravi\\programs\\IBM\\Websphere80\/java\/jre\/lib\/endorsed;C:\\ravi\\programs\\IBM\\Websphere80\\endorsed_apis;C:\\ravi\\programs\\IBM\\Websphere80\\java\\jre\\lib\\endorsed -Djava.security.auth.login.config=C:\\ravi\\programs\\IBM\\Websphere80\\profiles\\dc72002\/properties\/wsjaas.conf -Djava.security.policy=C:\\IBM\\ITM\\dchome\\7.2.0.0.2\/itcamdc\/etc\/datacollector.policy com.ibm.wsspi.bootstrap.WSPreLauncher -nosplash -application com.ibm.ws.bootstrap.WSLauncher com.ibm.ws.runtime.WsServer C:\\ravi\\programs\\IBM\\Websphere80\\profiles\\dc72002\\config ibmworkNode04Cell ibmworkNode04 server1","os.version":"6.1","server.name":"server1","num.ejb.modules":"7","java.version":"1.6.0","node.name":"ibmworkNode04","host.address":"ibmwork\/9.76.12.62","java.max.memory":"268435456","num.web.modules":"17","num.jdbc.connection.pools":"6","java.vm.info":"JRE 1.6.0 Windows 7 amd64-64 Compressed References 20110418_80450 (JIT enabled, AOT enabled)\nJ9VM - R26_Java626_GA_FP1_20110418_1915_B80450\nJIT  - r11_20110215_18645ifx8\nGC   - R26_Java626_GA_FP1_20110418_1915_B80450_CMPRSS\nJ9CL - 20110418_80450","was.version":"8.0.0.0","java.vm.name":"IBM J9 VM","transports":"   *:9047 HTTPS,    *:9064 HTTP,    *:9446 HTTPS,    *:9083 HTTP"}}
// props -- key/value pairs
function environmentData(props) {
    return {
        cid: 4,
        props: props
    };
}

// {"cid":5,"id":1,"cn":"ivtServer","mn":"","msig":""}
function methodDictionaryEntry(id, className, methodName, methodSign) {
    return {
        cid: 5,
        id: id,
        cn: className,
        mn: methodName,
        msig: methodSign
    }
}

function contextData(cxtData) {
    if (cxtData) {
        var items = [];
        for (var item in cxtData) {
            items.push(contextDataItem(item, cxtData[item]));
        }
        return contextDataGroup(items);
    }
}

// {"cid":6,"time":1315336874037,"type":4,"tid":163,"pid":4,"mid":29,"pmid":31,"rt":0,"cpu":0}
function methodEndInstance(threadId, time, methId, parentMethId, respTime, cpuTime, stackTrace, cxtData) {
    return {
        cid: 6,
        time: time,
        type: 4,
        tid: threadId,
        pid: 1,
        mid: methId,
        pmid: parentMethId,
        rt: respTime | 0,
        cpu: cpuTime | 0,
        st: stackTrace,
        cd: contextData(cxtData)
    };
}

// {"cid":7,"time":1315336873990,"type":3,"tid":163,"pid":4,"mid":30,"pmid":26}
function methodStartInstance(threadId, time, methId, parentMethId) {
    return {
        cid: 7,
        time: time,
        type: 3,
        tid: threadId,
        pid: 1,
        mid: methId,
        pmid: parentMethId
    };
}

// {"cid":8,"time":1315336872833,"id":2,"samp":1,"trt":16,"tcpu":15625000,"maxrt":16,"minrt":16}
function methodSummaryData(id, timeFirst, samples, totalResp, totalCpu, maxResp, minResp, maxCpu, minCpu) {
    return {
        cid: 8,
        id: id,
        samp: samples,
        trt: totalResp | 0,
        tcpu: totalCpu | 0,
        maxrt: maxResp | 0,
        minrt: minResp | 0,
        maxct: maxCpu | 0,
        minct: minCpu | 0
    };
}

// {"cid":9,"pn":"heap.collection","ver":"1.0","id":2} 9{"cid":9,"pn":"jms","ver":"1.0","id":1,"rpp":["jms.JMS"]}
function component(id, comp, version, methProbes, reqProbes) {
    return {
        cid: 9,
        id: id,
        pn: comp,
        ver: version,
        mpp: methProbes,
        rpp: reqProbes
    };
}

function edgeSeq(edge) {
    if (edge)
        return 1;
    else
        return 2;
}

// {"cid":11,"time":1371606553713,"type":2,"tid":127,"pid":8,"seq":2,"reqtype":2,"reqname":"lookup","reqmid":2,"rt":1954,"cpu":390002500,"st":"at javax.naming.InitialContext.lookup(InitialContext.java:431)\nat ivtEJBClient.init(Unknown Source)\nat com.ibm.ws.webcontainer.servlet.ServletWrapper.init(ServletWrapper.java:329)\nat com.ibm.ws.webcontainer.servlet.ServletWrapperImpl.init(ServletWrapperImpl.java:168)\nat com.ibm.ws.webcontainer.servlet.ServletWrapper.load(ServletWrapper.java:1283)\nat com.ibm.ws.webcontainer.filter.WebAppFilterManager.invokeFilters(WebAppFilterManager.java:973)\nat com.ibm.ws.webcontainer.webapp.WebAppRequestDispatcher.dispatch(WebAppRequestDispatcher.java:1382)\nat com.ibm.ws.webcontainer.webapp.WebAppRequestDispatcher.include(WebAppRequestDispatcher.java:546)\nat ivtServer.service(Unknown Source)\nat javax.servlet.http.HttpServlet.service(HttpServlet.java:668)\nat com.ibm.ws.webcontainer.servlet.ServletWrapper.service(ServletWrapper.java:1147)\nat com.ibm.ws.webcontainer.servlet.ServletWrapper.handleRequest(ServletWrapper.java:722)\nat com.ibm.ws.webcontainer.servlet.ServletWrapper.handleRequest(ServletWrapper.java:449)\nat com.ibm.ws.webcontainer.servlet.ServletWrapperImpl.handleRequest(ServletWrapperImpl.java:178)\nat com.ibm.ws.webcontainer.filter.WebAppFilterManager.invokeFilters(WebAppFilterManager.java:1020)\nat com.ibm.ws.webcontainer.webapp.WebApp.handleRequest(WebApp.java:3639)\nat com.ibm.ws.webcontainer.webapp.WebGroup.handleRequest(WebGroup.java:304)\nat com.ibm.ws.webcontainer.WebContainer.handleRequest(WebContainer.java:950)\nat com.ibm.ws.webcontainer.WSWebContainer.handleRequest(WSWebContainer.java:1659)\nat com.ibm.ws.webcontainer.channel.WCChannelLink.ready(WCChannelLink.java:195)\nat com.ibm.ws.http.channel.inbound.impl.HttpInboundLink.handleDiscrimination(HttpInboundLink.java:452)\nat com.ibm.ws.http.channel.inbound.impl.HttpInboundLink.handleNewRequest(HttpInboundLink.java:511)\nat com.ibm.ws.http.channel.inbound.impl.HttpInboundLink.processRequest(HttpInboundLink.java:305)\nat com.ibm.ws.http.channel.inbound.impl.HttpInboundLink.ready(HttpInboundLink.java:276)\nat com.ibm.ws.tcp.channel.impl.NewConnectionInitialReadCallback.sendToDiscriminators(NewConnectionInitialReadCallback.java:214)\nat com.ibm.ws.tcp.channel.impl.NewConnectionInitialReadCallback.complete(NewConnectionInitialReadCallback.java:113)\nat com.ibm.ws.tcp.channel.impl.AioReadCompletionListener.futureCompleted(AioReadCompletionListener.java:165)\nat com.ibm.io.async.AbstractAsyncFuture.invokeCallback(AbstractAsyncFuture.java:217)\nat com.ibm.io.async.AsyncChannelFuture.fireCompletionActions(AsyncChannelFuture.java:161)\nat com.ibm.io.async.AsyncFuture.completed(AsyncFuture.java:138)\nat com.ibm.io.async.ResultHandler.complete(ResultHandler.java:204)\nat com.ibm.io.async.ResultHandler.runEventProcessingLoop(ResultHandler.java:775)\nat com.ibm.io.async.ResultHandler$2.run(ResultHandler.java:905)\nat com.ibm.ws.util.ThreadPool$Worker.run(ThreadPool.java:1648)",
//"cd":{"cid":2,"ci":[
//{"cid":3,"key":"lurl","vt":"java.lang.String","val":"corbaloc:rir:\/NameServiceServerRoot"},{"cid":3,"key":"requestType","vt":"java.lang.String","val":"JNDI"},{"cid":3,"key":"requestName","vt":"java.lang.String","val":"lookup"},
//{"cid":3,"key":"lookupString","vt":"java.lang.String","val":"ejb\/ivtEJBObject"}]}}
function reqEndInstance(threadId, time, edge, reqType, reqName, reqMethId, respTime, cpuTime, stackTrace, cxtData) {
    return {
        cid: 11,
        time: time,
        type: 2,
        tid: threadId,
        pid: 1,
        seq: edgeSeq(edge),
        reqtype: reqType,
        reqname: reqName,
        reqmid: reqMethId,
        rt: respTime | 0,
        cpu: cpuTime | 0,
        st: stackTrace,
        cd: contextData(cxtData),
        requid: reqMethId
    };
}

// {"cid":12,"time":1315336872787,"type":1,"tid":163,"pid":5,"seq":1,"reqtype":1,"reqname":"TradeScenarioServlet","reqmid":1}
function reqStartInstance(threadId, time, edge, reqType, reqName, reqMethId) {
    return {
        cid: 12,
        time: time,
        type: 1,
        tid: threadId,
        pid: 1,
        seq: edgeSeq(edge),
        reqtype: reqType,
        reqname: reqName,
        reqmid: reqMethId,
        requid: reqMethId
    };
}

// {"cid":13,"time":1315337141912,"id":1,"samp":1,"trt":63,"tcpu":31250000,"maxrt":63,"minrt":63,"seq":1,"missed":0,"basert":63,"basecpu":31250000,"reqname":"_register"}
function reqSummary(firstTime, id, edge, samples, totalResp, totalCpu, maxResp, minResp, missed, baseResp, baseCpu, reqName) {
    return {
        cid: 13,
        id: id,
        time: firstTime,
        seq: edgeSeq(edge),
        samp: samples,
        trt: totalResp | 0,
        tcpu: totalCpu | 0,
        maxrt: maxResp | 0,
        minrt: minResp | 0,
        missed: missed,
        basert: baseResp | 0,
        basecpu: baseCpu | 0,
        reqname: reqName
    };
}

// {"cid":14,"tid":127,"tname":"WebContainer : 0","ttype":"webContainer","pn":"WAS"}
function threadDictEntry() {
    return {
        cid: 14,
        id: 1,
        tname: "Event Loop",
        ttype: "Event Loop",
        pn: "node.js"
    };
}

// {"cid":17,"ver":7200,"minclient":7201}
function version() {
    return {
        cid: 17,
        ver: 7200,
        minclient: 7201
    };
}

// {"cid":18,"name":"WAS","ver":"1.0","act":true,"profnames":["ejb","jca","jdbc","jndi","servlet","jms","webServices"],"refnames":["ejb","jca","jdbc","jndi","servlet","jms","webServices"]}
function product(name, version, active, profiles, refs) {
    return {
        cid: 18,
        name: name,
        ver: version,
        act: active,
        profnames: profiles,
        refs: refs
    };
}

var debugPort = 3000;
var hostname = os.hostname().split('.').shift();
var port;
var dir;
var fileNamePrefix = "dfe_data_" + process.pid + "_";

// JSO file handling configuration
// - eventsPerFile -- when this number of events is reached then JSO file will be committed once all top level requests are finished
// - fileCommitTime -- when this file is not modified for more than specified number of seconds then it will be committed
// - maxFiles -- when number of JSO files in directory reaches this value then the oldest one is deleted
// When the file is committed then all subsequent writes to it are ignored (i.e. for not yet finished requests).

function JsoFile(path, name) {
    this.nextMethId = 1;
    this.events = 0;
    this.activeRequests = 0;
    this.committed = false;
    this.buffers = [];
    this.totalLength = 0;
    this.samplingCount = 0;
    this.startTime=0;
    this.endTime=0;

    this.path = path;
    this.name = name;

    // write header
    this.write(version());
    this.write(product("node.js", "1.0", true, [], []));
    var self = this;
    requestTypes.forEach(function(type) {
        self.write(reqDictionaryEntry(type.id, type.name));
    });

    this.reqSummary = {};
    this.methSummary = {};
}

var writeBufferToREST = function(b, jso) {
    var appid = hostname + "_" + port;
    var BM_info = {};
    if(process.env.HYBRID_BMAPPID){
        BM_info = senderTool.BM_info;
        BM_info.bmapp_id = process.env.HYBRID_BMAPPID;
        BM_info.apphost = "test";
    }
    if(cfgDeepDive.maConfig && cfgDeepDive.maConfig.bmapp_id) appid = cfgDeepDive.maConfig.bmapp_id;
    else if(cfgDeepDive.maConfig && cfgDeepDive.app_guid && cfgDeepDive.maConfig.pretest) appid = cfgDeepDive.maConfig.app_guid;
    logger.debug("writing buffer to REST: "+b);
    var options = {
        method: 'POST'
    };

    if(cfgDeepDive.maConfig){
        options.hostname = cfgDeepDive.maConfig.ip;
        options.port = cfgDeepDive.maConfig.port;
        options.path = util.format(cfgDeepDive.maConfig.path,appid);
    }

    logger.info('Sending deepdive data for ', appid, ' from ', jso.startTime, ' to ', jso.endTime);
        zlib.gzip(b, function(err, result){
            if(err){
                logger.error(err);
                return;
            }
            //var wrappeddata = adaptor.addEncoder(result, {"ipaddr":appid, "start":jso.startTime, "end":jso.endTime});
            var url= require('url');
            if(!(process.env.DISABLE_MA_APM_SERVER=='true') && cfgDeepDive.maConfig && cfgDeepDive.maConfig.deepdive_url){
                var urlString = cfgDeepDive.maConfig.deepdive_url;
                var urlMap = url.parse(urlString);
                options.path = urlMap['path'] + '?tenant=34&origin='+cfgDeepDive.maConfig.apphost+'&namespace=node.js&type=aar.diagfs';//urlMap['path'];
                options.port = 443;
                options.hostname = urlMap['hostname'];
                options.host = urlMap['host'];
                var keyfile = cfgDeepDive.maConfig.pkcskey;
                if(keyfile){
                    options.pfx = new Buffer(keyfile, 'base64');
                    options.passphrase = cfgDeepDive.maConfig.password;
                }
                options.agent = false;
                if(process.env.tmp_rejectUnauthorized){
                    options.rejectUnauthorized = false;
                }

                var wrappeddata = adaptor.addEncoder(result, {"ipaddr":appid, "start":jso.startTime, "end":jso.endTime});
                var headers = {
                        'Content-Type': 'application/json',
                        'Content-Length': wrappeddata.length
                };
                
                options.headers = headers;
                senderTool.proxy_it(options,false);
                senderTool.data_sender(options, false, wrappeddata);
            }
            if( process.env.HYBRID_BMAPPID && BM_info.done){
                var bmurlMap = url.parse(BM_info.deepdive_url);
                var wrappeddata = adaptor.addEncoder(result, {"ipaddr":process.env.HYBRID_BMAPPID, "start":jso.startTime, "end":jso.endTime});
                var headers = {
                        'Content-Type': 'application/json',
                        'Content-Length': wrappeddata.length
                };
                var BM_options = {
                    host: bmurlMap['host'],
                    hostname: bmurlMap['hostname'],
                    port: bmurlMap['port']?bmurlMap['port']:BM_info.port,
                    agent: false,
                    path: bmurlMap['path'] + '?tenant=34&origin='+BM_info.apphost+'&namespace=node.js&type=aar.diagfs',
                    headers: headers,
                    cer: BM_info.cert,
                    key: BM_info.key,
                    pfx: BM_info.pfx,
                    method: 'POST',
                    passphrase: BM_info.passphrase
                };

                if((process.env.MONITORING_SERVER_URL || process.env.APM_BM_GATEWAY_URL) && bmurlMap.protocol!='http:'){
                    BM_options.servername = process.env.MONITORING_SERVER_NAME?process.env.MONITORING_SERVER_NAME:process.env.APM_SNI?process.env.APM_SNI:'default.server';
                    //BM_options.secureProtocol = 'TLSv1_2_client_method';
                }
                
                senderTool.proxy_it(BM_options,bmurlMap.protocol=='http:');
                senderTool.data_sender(BM_options, bmurlMap.protocol=='http:', wrappeddata);
            }

        });
};


JsoFile.prototype.read = function(filepath) {
    var b = fs.readFileSync(filepath);
    return b;
};

JsoFile.prototype.write_code = function(s) {
    var txt = JSON.stringify(s);
    logger.debug("writing", txt);
    var len = Buffer.byteLength(txt, "utf8");
    var b = new Buffer(2 + len);
    b.writeInt16BE(len, 0);
    b.write(txt, 2, undefined, "utf8");
    this.buffers.push(b);
    this.totalLength += b.length;
};

JsoFile.prototype.write = function(s, sync) {
    if(sync && (mm.envType == 'CloudOE' || mm.envType == 'Cloudnative')){
        this.write_code(s);
    }else {
        process.nextTick(function(){this.write_code(s)}.bind(this));
    }
};

// write summary, close and rename to jso
JsoFile.prototype.commit = function() {
    var self = this;

    if (!self.committed) {
        self.endTime = getCurrTime();
        // write request summary
        for (var rn in self.reqSummary) {
            var rs = self.reqSummary[rn];
            logger.debug("writing reqSummary", rn, "samples", rs.samples);
            if (rs.samples > 0) {
                self.write(reqSummary(rs.startTime, rs.typeId, rs.edge, rs.samples, rs.totalResp, rs.totalCpu, rs.maxResp, rs.minResp, 0, rs.totalResp / rs.samples, rs.totalCpu / rs.samples, rn),true);
            }
        }

        // write method dictionary and summary
        for (var mn in self.methSummary) {
            var ms = self.methSummary[mn];
            self.write(methodDictionaryEntry(ms.id, "", mn, ""),true);
            if (ms.samples > 0) {
                self.write(methodSummaryData(ms.id, ms.startTime, ms.samples, ms.totalResp, ms.totalCpu, ms.maxResp, ms.minResp, ms.maxCpu, ms.minCpu),true);
            }
        }

        if (mm.envType === 'CloudOE' || mm.envType === 'Cloudnative') {
            var contents = Buffer.concat(self.buffers, self.totalLength);
            try {
                writeBufferToREST(contents, self);
            }catch(e){
                logger.error("Failed to send jso to REST service: ",e);
                logger.debug("Failed to send jso to REST service: ",e.stack);
            }
            if( process.env.KNJ_LOG_LEVEL == 'all' ){
                fs.open(self.path + self.name + ".jso", "w", function(err, fd) {
                    var contents = Buffer.concat(self.buffers, self.totalLength);
                    fs.write( fd, contents, 0, contents.length, null, dummy );
                    fs.close( fd, dummy );
                    removeOldFiles();
                });
            }
        } else {
            fs.open(self.path + self.name + ".jso", "w", function(err, fd) {
                var contents = Buffer.concat(self.buffers, self.totalLength);
                fs.write( fd, contents, 0, contents.length, null, dummy );
                fs.close( fd, dummy );
                removeOldFiles();
            });
        }

        self.committed = true;
        reqManager.resetEgdeReqCount();
    }
}

JsoFile.prototype.startRequest = function(threadId, reqId, timer, edge, type, name) {
    var self = this;
    type = requestStringToTypes[type];
    if(edge){
        cfgDeepDive = config.getConfig().deepDive;
    }

    /* switch to sampling on threadId which is actually the request Id */
    if (!self.committed && !(self.samplingCount % cfgDeepDive.sampling) && (cfgDeepDive.methodTrace || edge)) {
        if (edge) {
            self.activeRequests += 1;
            self.events+=1;
        }

        //self.events += 1;

        if (!(name in self.reqSummary)) {
            self.reqSummary[name] = {
                typeId: type.id,
                startTime: timer.startTimeMillis,
                edge: edge,
                samples: 0,
                totalResp: 0,
                totalCpu: 0
            };
            logger.debug("added request to reqSummary", name);
        } else {
            logger.debug("request was already in reqSummary", name);
        }
        self.write(reqStartInstance(threadId, timer.startTimeMillis, edge, type.id, name, reqId),true);
    }
}

JsoFile.prototype.stopRequest = function(threadId, reqId, timer, edge, type, name, stackTrace, cxtData) {
    var self = this;
    type = requestStringToTypes[type];

    /* switch to sampling on threadId which is actually the request Id */
    if (!self.committed && !(self.samplingCount % cfgDeepDive.sampling) && (cfgDeepDive.methodTrace || edge)) {
        if (edge) {
            --self.activeRequests;
        }

        //self.events += 1;

        var rs = self.reqSummary[name];
        if (rs) {
            logger.debug("updating request", name);

            rs.totalResp += timer.timeDelta;
            rs.totalCpu += timer.cpuTimeDelta;
            if (rs.samples == 0 || rs.maxResp < timer.timeDelta) {
                rs.maxResp = timer.timeDelta;
            }
            if (rs.samples == 0 || rs.minResp > timer.timeDelta) {
                rs.minResp = timer.timeDelta;
            }
            rs.samples += 1;
            self.write(reqEndInstance(threadId, timer.startTimeMillis + Math.floor(timer.timeDelta), edge, type.id, name, reqId, timer.timeDelta, timer.cpuTimeDelta, stackTrace, cxtData),true);
        } else {
            logger.debug("request not found in summary", name);
        }

        if (self.activeRequests == 0 && !self.committed && self.events >= cfgDeepDive.eventsPerFile) {
            logger.info("committing by max events reached", self.events, cfgDeepDive.eventsPerFile);
            self.commit();
        }
    }
}

JsoFile.prototype.startMethod = function(threadId, timer, name, parentId) {
    var self = this;
    /* switch to sampling on threadId which is actually the request Id */
    if (!self.committed && cfgDeepDive.methodTrace && !(self.samplingCount % cfgDeepDive.sampling)) {
        //self.events += 1;

        var methId;

        var ms = self.methSummary[name];
        if (ms) {
            methId = ms.id;
        } else {
            methId = self.nextMethId;
            self.nextMethId += 1;
            self.methSummary[name] = {
                id: methId,
                samples: 0,
                totalResp: 0,
                totalCpu: 0
            };
        }

        self.write(methodStartInstance(threadId, timer.startTimeMillis, methId, parentId),true);

        return methId;
    }
}

JsoFile.prototype.stopMethod = function(threadId, timer, name, parentId, stackTrace, cxtData) {

    var self = this;

    /* switch to sampling on threadId which is actually the request Id */
    if (!self.committed && cfgDeepDive.methodTrace && !(self.samplingCount % cfgDeepDive.sampling)) {
        //self.events += 1;

        var ms = self.methSummary[name];
        if (ms) {
            ms.totalResp += timer.timeDelta;
            ms.totalCpu += timer.cpuTimeDelta;
            if (ms.samples == 0 || ms.maxResp < timer.timeDelta) {
                ms.maxResp = timer.timeDelta;
            }
            if (ms.samples == 0 || ms.minResp > timer.timeDelta) {
                ms.minResp = timer.timeDelta;
            }
            ms.samples += 1;
            self.write(methodEndInstance(threadId, timer.startTimeMillis + Math.floor(timer.timeDelta), ms.id, parentId, timer.timeDelta, timer.cpuTimeDelta, stackTrace, cxtData),true);
        }
    }
}

// open

var currentJso;
var nextJsoId = 1;
var jsoTimeout;

var emptyJso = {
    write: function() {},

    commit: function() {reqManager.resetEgdeReqCount();},

    startRequest: function() {},

    stopRequest: function() {},

    startMethod: function() {},

    stopMethod: function() {}
};

function initDirAndPort() {
    port = (typeof v8debug === 'object') ? debugPort : mm.metric.port;
    if(mm.envType == 'CloudOE' || mm.envType === 'Cloudnative') {
        port = port || 'N/A';
        dir = "./dchome/";
    }else{

        var tmpFolder = '/tmp';
        if(process.env.TMP)  {
            tmpFolder = process.env.TMP;
        }
        try  {
            var content = fs.readFileSync(tmpFolder+"/knj/knj_dc_runtime_dir.txt");
            var line = content.toString().split('\n')[0];
            dir = line + "/" + hostname + "_" + port + "/data/request/";
        } catch (err){
            dir = __dirname + "/../../../njdchome/" + hostname + "_" + port + "/data/request/";
            logger.error("error on get DC_RUNTIME_DIR",err);
        }
    
    }
}

function mkdir(dir) {
    var s = dir.split("/");
    var d = "";
    if(dir.indexOf('.')==0){
        s.forEach(function(e) {
            d = d+e+"/";
            if (!fs.existsSync(d)) {
                fs.mkdirSync(d);
            }
        });
    }else{
        s.forEach(function(e) {
            d = d + "/" + e;
            if (!fs.existsSync(d)) {
                fs.mkdirSync(d);
            }
        });
    }
}

function removeOldFiles() {
    var maxFiles = cfgDeepDive.maxFiles;

    fs.readdir(dir, function(err, files) {
        var r = new RegExp(dir + fileNamePrefix + "(\\d*)_(\\d*).jso");
        files = files.map(function(name) {
            return dir + name;
        }).filter(function(name) {
            var matchResult = r.test(name);
            if (!matchResult && name.indexOf('.tmp') == -1) {
                fs.unlink(name, dummy);
            }
            return matchResult;
        });

        if (files.length <= maxFiles) return;

        var r = new RegExp(dir + fileNamePrefix + "(\\d*)_(\\d*).jso");
        var nums = files.map(function(name) {
            return {"time":r.exec(name)[1],"index":parseInt(r.exec(name)[2])};
        });
        nums = nums.sort(function(a, b) {
            return a.index - b.index;
        }).slice(0, nums.length - maxFiles);
        nums.forEach(function(num) {
            fs.unlink(dir + fileNamePrefix + num.time+"_"+num.index + ".jso", dummy);
        });
    });

}

exports.open = function() {
    cfgDeepDive = config.getConfig().deepDive;
    initDirAndPort();
    if (currentJso) {
        if (currentJso.committed) {
            currentJso = null;
        } else {
            return currentJso;
        }
    }
    if (port || process.env.KNJ_LOG_LEVEL == 'all') {
        mkdir(dir);
        var name = fileNamePrefix + (new Date()).getTime() +"_" +nextJsoId;
        logger.debug("opening file", dir, "/", name);
        nextJsoId += 1;
        var jso = new JsoFile(dir, name);
        jso.startTime = getCurrTime();
        currentJso = jso;
        jsoTimeout = setTimeout(function() {
            logger.info("Commiting file by timeout", jso.name);
            jso.commit();
        }, cfgDeepDive.fileCommitTime * 1000);
        return currentJso;
    } else {
        logger.info("Unable to store data into jso file, as port is not initalized.");
        return emptyJso;
    }
}
