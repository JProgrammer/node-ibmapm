# Node.js Data Collector for IBM Bluemix Application Monitoring and IBM Application Performance Monitoring Bluemix Integration Agent  

This Node.js data collector is used to monitor your Node.js applications on Bluemix. By cofiguring only the data collector, you can view the health, availability, and performance of your Bluemix Node.js application. Agent installation or configuration is no longer needed. 

You need an APM SaaS V8.1.3.2 account to use the data collector package.

To monitor your Node.js application, complete the following steps to install the Node.js data collector in your Node.js application:  
1. **Install Node.js Data Collector**:  
- ***For local application***: In the home directory of your Node.js application, run `npm install ibmapm --save` to install the ibmapm package, and then add the dependencies into the node_modules of your application.  
- ***For Bluemix application***: In the `package.json` file, add `"ibmapm":"0.1.*"` to the `dependencies` section to reference this package.  
2. **Add data collector plugin**:  
    In the first line of your application entry file, insert `require('ibmapm');` to add the data collector plug-in that is included in this package.  
3. **Configure Data Collector to define target server**:  
- ***For local application***: Edit the `node_modules/ibmapm/etc/config.properties` file, define `MONITORING_SERVER_TYPE` and `MONITORING_SERVER_URL`.  
    Sample `config.properties` file:  
```
MONITORING_SERVER_TYPE=BAM  
#MONITORING_SERVER_URL=http://1.2.3.4:80/1.0/monitoring/data  (TODO, please go to "BAM Specific configuration" Section by now)
MONITORING_APPLICATION_NAME=myapp  
```
or
```
MONITORING_SERVER_TYPE=BI  
MONITORING_SERVER_URL=https://1.2.3.4:443  
MONITORING_APPLICATION_NAME=myapp  
```
- ***For Bluemix application***: Set environment variable in the manifest.yml file of your application or on the Bluemix UI.
    Sample environment variables:  

```
  env:
    MONITORING_SERVER_TYPE: BAM  
#    MONITORING_SERVER_URL: http://1.2.3.4:80/1.0/monitoring/data  (TODO, please go to "BAM Specific configuration" Section by now)
    MONITORING_APPLICATION_NAME: myapp  
```
or
```
  env:
    MONITORING_SERVER_TYPE: BI  
    MONITORING_SERVER_URL: https://1.2.3.4:443  
    MONITORING_APPLICATION_NAME: myapp  
```

Please go to "[BAM Specific configuration](#BAMSec)" section or "[BI Specific configuration](#BISec)" section based on your target server to next steps.  

There are also some **Shared configuration** between the BI and the BAM server, which are also set in the config.properties file or on the Bluemix UI. You can change these configurations according to the description in the following table.    

**Shared Configuration**  

Environment Variable              | Sample Values                         | Default Value | Description                                               
:---------------------------------|:--------------------------------------|:--------------|:-------------------------------------------------------
MONITORING_SECURITY_URL (optional) |http://keyfile.mybluemix.net/keyfile.p12 | not set      |If you provide a keyfile in a webserver instead of copying it into the etc folder, you can use MONITORING_SECURITY_URL to define the URL. The data collector will skip the keyfile in the etc folder, and use the one in MONITORING_SECURITY_URL.
MONITORING_SERVER_NAME(conditional)|test.ibm.com, abc.yourdomain.com       | not set       |If you use the config.properties file to define the target server url, and the Owner/CN of the keyfile is not default.server (not the default onPremise server keyfile), this field is **required**. Set this environment to the hostname ofyour target server url (or your the Owner/CN of your keyfile). 
KNJ_ENABLE_TT (optional)           |"true", "True", "", "False", or not set |not set        |Enables or disables transaction tracking of AAR. By default, transaction tracking is disabled.
KNJ_LOG_LEVEL (optional)           |"off", "error", "info", "debug", "all" |"error"        |Specifies at which level the log is printed.                                               
KNJ_SAMPLING (optional)           |1, 10, 100                             |10             |The number of requests based on which a sample is taken. By default, data collector takes one sample of every 10 requests.
KNJ_MIN_CLOCK_TRACE (optional)      |1, 10, 100                             |0              |If the response time of a request instance exceeds the value of this variable, the data collector collects its method trace. By default, data collector always collects method trace.
KNJ_MIN_CLOCK_STACK (optional)      |1, 10, 100, 1000                       |0              |If the response time of a request instance exceeds the value of this variable, the data collector collects its stack trace. By default, data collector always collect stack trace.

### <a name="BAMSec"></a>BAM Specific configuration ##
4. Set **Connection Information** in the configuration file.  
The configuration file is by default "config.json" in the running path of your Node.js application, or the file that is defined in the *KNJ_CONFIG_FILE* environment variable.   
For more information, see the Supported Environment Variables table.  
Sample configuration file (The default config.json at the running path is used):  
```
{
        "ingressURL" : "http://1.2.3.4:80/1.0/monitoring/data",
        "tenantID" : "6defb2b3-4e44-463b-9731-09c64e7fdb67"
}
```  

**BAM Spedified Connection Information**  

|Connection Variable        | Sample Values                         | Default Value   | Comments                                                   |
|:---------------------------|:--------------------------------------|:----------------|:-----------------------------------------------------------|
|ingressURL (**must have**)  |"http://1.2.3.4:80/1.0/monitoring/data"|N/A              |Ingress URL that all monitoring data is sent to.          |
|tenantID (**must have**)    |"6defb2b3-4e44-463b-9731-09c64e7fdb67" |N/A              |An MD5 code that can identify your company.                  |
|metrics (optional)          |"metric"                               |"metric"         |The Kafka topic that the metrics are sent to. |
|AAR (optional)              |"aar/middleware"                       |"aar/middleware" |The Kafka topic that AAR is sent to.     |
|ADR (optional)              |"adr/middleware"                       |"adr/middleware" |The Kafka topic that ADR is sent to.     |


5. (Optional) Configure **Environment Variables** by editing the `manifest.yml` file (for Bluemix) or by using the `export` command (for local test).  

If your application will be pushed to Bluemix, add the following lines in the manifest.yml file to set the required environment variable:
```
env:
  - KNJ_CONFIG_FILE: config.json
  - KNJ_RESTCLIENT_TIMER: "100"
  - KNJ_RESTCLIENT_MAX_RETRY: 2

```
If your application will be run on local test, run the following commands to export the required environment variables before you start the application:
```
export KNJ_CONFIG_FILE=config.json
export KNJ_RESTCLIENT_TIMER=100
export KNJ_RESTCLIENT_MAX_RETRY=2
```

**BAM Data Collector Specified Environment Variables**  

|Environment Variable              | Sample Values                         | Default Value | Comments                                               |
|:---------------------------------|:--------------------------------------|:--------------|:-------------------------------------------------------|
|KNJ_CONFIG_FILE (optional)        |"config.json", "test-config.json"      |"config.json"  |Specifies a configuration file name (full path or relative path to the running path of your Node.js application). For the content of the file, see Step 3.|
|KNJ_ENABLE_DEEPDIVE (optional)     |"true", "True", "", "False" or not set |not set        |Enables or disables diagnostics. By default, diagnostics is disabled.|
|KNJ_ENABLE_METHODTRACE (optional)  |"true", "True", "", "False" or not set |not set        |Enables or disables Method Trace. By default, method trace is diabled.|
|KNJ_ENABLE_PROFILING (optional)    |"true", "True", "", "False" or not set |not set        |Enables or disables method profiling. By default, method profiling is disabled.|
|KNJ_RESTCLIENT_TIMER (optional)   |"1000", "100"                          |"1000"         |Interval at which requests are sent to the sever, in milliseconds.|
|KNJ_RESTCLIENT_MAX_RETRY(optional)|"3", "2"                               |"3"            |Specifies the retry times when a reqeust fails.                |  

### <a name="BISec"></a>BI Specific configuration ##
4. **BI Agent Data Collector Specified Server and Credential Configuration**

Please configure BI Agent Server and Credential information in etc/global.environment file or environment variables:

- ***For Local application***: 
Sample etc/global.environment file:  
```
APM_KEYFILE=keyfile.p12
APM_KEYFILE_PSWD=passw0rd
```

- ***For Bluemix application***: 
Sample environment variable:
```
env: 
  - APM_KEYFILE_PSWD: passw0rd
  - APM_KEYFILE: keyfile.p12
```

All configuration items listed below are supported for both configuration file and environment variables. Environment variable will take first priority.
|Configuration Item                | Sample Values                         | Default Value | Comments                                               |
|:---------------------------------|:--------------------------------------|:--------------|:-------------------------------------------------------|
|APM_BM_GATEWAY_URL (required*)    |"https://1.2.3.4:443" or not set       |not set        |The URL BI agent provides to collect data. Be overwritten by MONITORING_SERVER_URL|
|APM_SNI (sometimes required*)     |"abc.ibm.com" or not set               |"default.server" |When the keyfile's Owner/CN is not default.server (not the default onPremise server keyfile), this field is **required**!. Please assign this environment with your target server url's hostname(or your keyfile's Owner/CN). Be overwritten by MONITORING_SERVER_NAME|
|APM_KEYFILE (required*)           |"keyfile_test.p12" or not set          |"keyfile.p12"  |You will put a keyfile in etc folder for server credential, assign the file name here. Be overwritten by MONITORING_SECURITY_URL|
|APM_KEYFILE_PSWD (required)       |"passw0rd" or not set                  |"ccmR0cKs!"    |To set the password of the keyfile here.|

The items with (required*) mean, although they are required, but they could be overwritten by config.properities, if you have assign correct information in config.properties, you can ignore these items.

5. If your application will be pushed to Bluemix, add the following lines in the manifest.yml file to set the required environment variable:  
```
env:
  - KNJ_DISABLE_METHODTRACE: "true"
```
If your application will be run on local test, run the following commands to export the required environment variables before you start the application:  
```
export KNJ_DISABLE_METHODTRACE=true
```

**BI Agent Data Collector Specified Environment Variables**  

|Environment Variable              | Sample Values                         | Default Value | Comments                                               |
|:---------------------------------|:--------------------------------------|:--------------|:-------------------------------------------------------|
|KNJ_DISABLE_METHODTRACE (optional)  |"true", "True", "", "False" or not set |not set        |To disables Method Trace. By default, method trace is enabled.|


