var http = require('http');
var log4js = require('log4js');
var logger =log4js.getLogger('knj_log');


var MetricSender = function() {
};

MetricSender.prototype.send = function(data, sender)  {
	
    if(!data)  {
        logger.error('can not send undefined data' );
        return;
    }
    // write data to request body    
    if (sender.getDataType() === 'xml') {
        var data_string = data.getAppInfo();
        data_string += '\n';
        data_string += data.getHttpReq();
        data_string += '\n';
        data_string += data.getGC();
        data_string += '\n';
//        data_string += data.getProfiling();
//        data_string += '\n';
        logger.info( 'XML message: ' + data_string );
    
        sender.send(data_string, function(msg)  {
            // currently we do not handle errors, so will ignore msg
            if( msg !== undefined )
                logger.error( 'sender callback with message: ' + msg );
        });
    } else if (sender.getDataType() === 'json') {

        var jsonAppInfo = data.getJSONAppInfo();
        var jsonAppInfo2 = data.getJSONAppInfo2();
        var jsonComputeInfo = data.getJSONComputeInfo();
        var jsonHttpReq = data.getJSONHttpReq();
        var jsonGC = data.getJSONGC();
        var jsonEventLoop = data.getJSONEventLoop();
        var jsonProfiling = data.getJSONProfiling();
        var jsonProfilingMeta = data.getJSONProfilingMeta();

        try {
            sender.send({appInfo:jsonAppInfo, appInfo2:jsonAppInfo2, computeInfo:jsonComputeInfo, 
                httpReq: jsonHttpReq, GC: jsonGC, El: jsonEventLoop, prof: jsonProfiling, profMeta: jsonProfilingMeta});
        } catch (e) {
            logger.error('Error while sending json data: ' + e );
            logger.info( e.stack );
        }
    } else {
        logger.error( 'Unknown sender data type: ' + sender.getDataType() );
    }
}

exports.metricSender = new MetricSender();
