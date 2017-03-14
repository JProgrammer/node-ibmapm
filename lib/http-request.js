var url = require( 'url' );

function HttpRequest(req, responseTime)  {
    this.reqUrl = req.url;
    this.hitCount = 1;
    this.totalResponseTime = responseTime;
    this.averageResponseTime = responseTime;
    this.latestResponseTime = responseTime;
    this.method = req.method;
}

HttpRequest.prototype.updateResponseTime = function updateResponseTime( req, responseTime)  {
    this.reqUrl = req.url;
    this.hitCount ++;
    this.totalResponseTime += responseTime;
    this.averageResponseTime = this.totalResponseTime / this.hitCount >>> 0;
    this.latestResponseTime = responseTime;
}

module.exports = HttpRequest;
