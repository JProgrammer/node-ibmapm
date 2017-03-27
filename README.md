# Node.js Data Collector for IBM Application Performance Management (APM) and IBM Bluemix Application Monitoring (BAM)

This Node.js data collector is used to monitor local and Bluemix Node.js applications. By configuring the data collector, you can view the health, availability, and performance of your Node.js application.   

You need an APM SaaS V8.1.3.2 account to use the data collector package.  

Complete the following configuration tasks according to your needs.  


----------

## Configuring Node.js data collector for **Bluemix** applications using **APM server**  

To configure your Node.js data collector for your Bluemix application, and connect the data collector to the APM server, complete the following steps:  
 
 1-In the `package.json` file of your application, add `"ibmapm":"0.1.*"` to the `dependencies` section to reference this package.  

 2-In the beginning of your application main file, add `require('ibmapm');`. For example, if you start your application by running the `node app.js` command, app.js is the main file of your application.  

 3-In the `manifest.yml` file of your application or on the **Bluemix UI**, set the following environment variables to define the target server:  
```
    env: 
        MONITORING_SERVER_TYPE: BI
        APM_BM_GATEWAY_URL: https://<server ip or hostname>:443
        APM_KEYFILE_PSWD: <passw0rd>
        APM_KEYFILE_URL: http://<your key file server>/<keyfile.p12>
```

 4-From the home directory of your Node.js application, run the following command:  

```
 cf push
```


----------

## Configuring Node.js data collector for **local** applications using **APM server**  

To configure your Node.js data collector for your local application, and connect the data collector to the APM server, complete the following steps:  

 1-In the home directory of your Node.js application, run `npm install ibmapm --save` to install the ibmapm package.  

 2-In the beginning of your application main file, add `require('ibmapm');`.  
    
  Tip: If you start your application by running the `node app.js` command, app.js is the main file of your application.  

 3-In the `node_modules/ibmapm/etc/config.properties` file, set the following variables:  
  ```
  MONITORING_SERVER_TYPE: BI
  MONITORING_APPLICATION_NAME=<myapp> 
  ```

    The `MONITORING_APPLICATION_NAME` must be unique on the same host.  

 4-In the `node_modules/ibmapm/etc/global.environment` file, set the following environment variables:  
  ```
    APM_BM_GATEWAY_URL=https://<server ip or hostname>:443
    APM_KEYFILE=<keyfile.p12>
    APM_KEYFILE_PSWD=<passw0rd>
  ```

 5-Copy the server key file, for example, `keyfile.p12`, to the `node_modules/ibmapm/etc` directory.  

 6-Restart the Node.js application.  



----------

## Configuring Node.js data collector for **Bluemix** applications using **BAM server**  

To configure your Node.js data collector for your Bluemix application, and connect the data collector to the BAM server, complete the following steps:  

 1-In the `package.json` file of your application, add `"ibmapm":"0.1.*"` to the `dependencies` section to reference this package.  
    
 2-In the beginning of your application main file, add `require('ibmapm');`. For example, if you start your application by running the `node app.js` command, app.js is the main file of your application.  

 3-In the `manifest.yml` file of your application or on the **Bluemix UI**, set the following variable to define the target server:  
```
  env:
    MONITORING_SERVER_TYPE: BAM  
```

 4-Create a new file in the running path of your Node.js application, and name it to `config.json`.   
  >Note: If you use other names, you need to define it in the *KNJ_CONFIG_FILE* environment variable. For more information about *KNJ_CONFIG_FILE*, see the **Supported Environment Variables** table.  

 5-Set **Connection Information** in the configuration file by defining `ingressURL` and `tenantID` to the format of the following example:  
```
{
        "ingressURL" : "<http://1.2.3.4:80/1.0/monitoring/data>",
        "tenantID" : "<6defb2b3-4e44-463b-9731-09c64e7fdb67>"
}
```  

 6-From the application home directory, run the following command:  
```
cf push
```

----------

## Configuring Node.js data collector for **local** applications using **BAM** server  

To configure your Node.js data collector for your local application, and connect the data collector to the BAM server, complete the following steps:

 1-In the home directory of your Node.js application, run `npm install ibmapm --save` to install the `ibmapm` package.  

 2-In the beginning of your application main file, add `require('ibmapm');`.  
    
  Tip: If you start your application by running the `node app.js` command, app.js is the main file of youR application.  

 3-In the `node_modules/ibmapm/etc/config.properties` file, set the `MONITORING_SERVER_TYPE` variable:  
```
MONITORING_SERVER_TYPE=BAM   
```

 4-Create a new file in the running path of your Node.js application, and name it to `config.json`.   

  >Note: If you use other names, you need to define it in the *KNJ_CONFIG_FILE* environment variable. For more information about *KNJ_CONFIG_FILE*, see the **Supported Environment Variables** table.  

 5-Set **Connection Information** in the configuration file `config.json` by defining `ingressURL` and `tenantID` to the format of the following example:  
```
{
        "ingressURL" : "<http://1.2.3.4:80/1.0/monitoring/data>",
        "tenantID" : "<6defb2b3-4e44-463b-9731-09c64e7fdb67>"
}
```  

 6-Restart the application.  


To enable deep-dive diagnostics, method trace, and transaction tracking, see the **Supported Environment Variables** section.  


----------

## Customizations for the Node.js data collector if it is connected to the APM server  

Refer to the description in this section to set environment variables and change connection information according to your need.  

### Reconnecting the data collector to the APM server
You need to reconnect the data collector to the APM server under any of the following circumstances:  

* The APM server changes.
* The key file changes.
* The key file password changes.

Complete one of the following tasks based on you application type:

* To configure connection for Bluemix applications, add the following environment variables on the **Bluemix UI** or in the `manifest.yml` file:  
  ```
    env: 
      - APM_BM_GATEWAY_URL: https://<server ip or hostname>:443
      - APM_KEYFILE_PSWD: <passw0rd>
      - APM_KEYFILE_URL: http://<your key file server>/<keyfile.p12>
  ```
    And then from the application home directory, run the `cf push` command to repush the application.
  
* To configure connection for local applications, edit the `global.environment` file in the `etc` directory to the format of the following example:  
  ```
    APM_BM_GATEWAY_URL=https://<server ip or hostname>:443
    APM_KEYFILE=<keyfile.p12>
    APM_KEYFILE_PSWD=<passw0rd>
  ```
    And then restart your application.
  

### Supported variables
This section introduces all supported variables for the Node.js data collector that is connected to the APM server.    

**Variables that you can set in `manifest.yml`, `global.environment`, or on the `Bluemix UI`** 

* If your application runs on Bluemix, you can set the following variables in the `manifest.yml` file or on the **Bluemix UI**.  
* If your application runs on local test, you can set the following variables in the `config.properties` file.  


|Variable                | Sample Values                         | Default Value | Description                                               |
|:---------------------------------|:--------------------------------------|:--------------|:-------------------------------------------------------|
|APM_BM_GATEWAY_URL (required)    |"https://1.2.3.4:443" or not set       |not set        |The URL BI agent provides to collect data. If you have set the `MONITORING_SERVER_URL` in the `config.properties` file or the **Bluemix UI**, you do not need to set this variable.|
|APM_KEYFILE (required)           |"keyfile_test.p12" or not set          |"keyfile.p12"  |The keyfile that you put in etc folder for server credentials.|
|APM_KEYFILE_PSWD (required)       |"passw0rd" or not set                  |"ccmR0cKs!"    |The password of the keyfile.|
|APM_SNI (conditional)     |"abc.ibm.com" or not set               |"default.server" |When the keyfile's Owner/CN is not default.server (not the default onPremise server keyfile), this field is **required**. Assign this environment with your target server url's hostname (or your keyfile's Owner/CN).|


**Variables that you can set in `manifest.yml`, `config.properties`, or on `Bluemix UI`** 

* If your application runs on Bluemix, you can set the following variables in the `manifest.yml` file or on the **Bluemix UI**.  
* If your application runs on local test, you can set the following variables in the `config.properties` file.  


|Variable                | Sample Values                         | Default Value | Description                                               |
|:---------------------------------|:--------------------------------------|:--------------|:-------------------------------------------------------|
|KNJ_ENABLE_TT (optional)           |"true", "True", "", "False", or not set |not set        |Enables or disables transaction tracking of AAR. By default, transaction tracking is disabled.
|KNJ_LOG_LEVEL (optional)           |"off", "error", "info", "debug", "all" |"error"        |Specifies at which level the log is printed.                                               
|KNJ_SAMPLING (optional)           |1, 10, 100                             |10             |The number of requests based on which a sample is taken. By default, data collector takes one sample of every 10 requests.
|KNJ_MIN_CLOCK_STACK (optional)      |1, 10, 100, 1000                       |0              |If the response time of a request instance exceeds the value of this variable, the data collector collects its stack trace. By default, data collector always collect stack trace.
|MONITORING_SECURITY_URL (optional) |http://keyfile.mybluemix.net/keyfile.p12 | not set      |If you provide a keyfile in a webserver instead of copying it into the etc folder, you can use MONITORING_SECURITY_URL to define the URL. The data collector will skip the keyfile in the etc folder, and use the one in MONITORING_SECURITY_URL.
|MONITORING_SERVER_NAME(conditional)|test.ibm.com, abc.yourdomain.com       | not set       |If you use the config.properties file to define the target server url, and the Owner/CN of the keyfile is not default.server (not the default onPremise server keyfile), this field is **required**. Set this environment to the hostname of your target server url (or your the Owner/CN of your keyfile).

**Variables that you can set in `manifest.yml`, or on the`Bluemix UI`** 

|Variable                | Sample Values                         | Default Value | Comments                                               |
|:---------------------------------|:--------------------------------------|:--------------|:-------------------------------------------------------|
|KNJ_DISABLE_METHODTRACE (optional)  |"true", "True", "", "False" or not set |not set        |To disables Method Trace. By default, method trace is enabled.|


----------


### Customizations for the Node.js data collector if it is connected to the BAM server  

Refer to the description in this section to change connection information and to set environment variables and according to your need.  

**Reconnecting the data collector to the BAM server**
If the BAM server is changed, you need to reconnect the data collector to the BAM server.  

You can edit the configuration file to reconnect the data collector to the BAM server. The configuration file is by default `config.json` in the running path of your Node.js application, or the file that is defined in the *KNJ_CONFIG_FILE* environment variable. For more information, see the following **Supported Environment Variables** sub-section.   

After you configure the connection, restart your application for the changes to take effect.  

|Variable        | Sample Values                         | Default Value   | Description                                                   |
|:---------------------------|:--------------------------------------|:----------------|:-----------------------------------------------------------|
|ingressURL (**must have**)  |"http://1.2.3.4:80/1.0/monitoring/data" |N/A              |Ingress URL that all monitoring data is sent to.          |
|tenantID (**must have**)    |"6defb2b3-4e44-463b-9731-09c64e7fdb67" |N/A              |An MD5 code that can identify your company.                  |
|metrics (optional)          |"metric"                               |"metric"         |The Kafka topic that the metrics are sent to. |
|AAR (optional)              |"aar/middleware"                       |"aar/middleware" |The Kafka topic that AAR is sent to.     |
|ADR (optional)              |"adr/middleware"                       |"adr/middleware" |The Kafka topic that ADR is sent to.     |

**Supported environment variables**  
You can set the **Environment Variables** in the `manifest.yml` file, on the **Bluemix UI**, or by using the `export` command (for local test).   

* If your application runs on Bluemix, add the environment variables on the Bluemix UI or in the `manifest.yml` file to the format of the following example:  
```
env:
  - KNJ_CONFIG_FILE: <config.json>
  - KNJ_RESTCLIENT_TIMER: <100>
  - KNJ_RESTCLIENT_MAX_RETRY: <2>

```
And then from the application home directory, run the `cf push` to repush your application.  

* If your application runs on local test, run commands to the format of the following example to export the environment variable settings before you start the application:  
```
export KNJ_CONFIG_FILE=<config.json>
export KNJ_RESTCLIENT_TIMER=<100>
export KNJ_RESTCLIENT_MAX_RETRY=<2>
```
And then restart your application.

|Variable              | Sample Values                         | Default Value | Description                                               |
|:---------------------------------|:--------------------------------------|:--------------|:-------------------------------------------------------|
|KNJ_CONFIG_FILE (optional)        |"config.json", "test-config.json"      |"config.json"  |Specifies a configuration file name (full path or relative path to the running path of your Node.js application).|
|KNJ_ENABLE_DEEPDIVE (optional)     |"true", "True", "", "False" or not set |not set        |Enables or disables diagnostics. By default, diagnostics is disabled.|
|KNJ_ENABLE_METHODTRACE (optional)  |"true", "True", "", "False" or not set |not set        |Enables or disables Method Trace. By default, method trace is disabled.|
|KNJ_ENABLE_PROFILING (optional)    |"true", "True", "", "False" or not set |not set        |Enables or disables method profiling. By default, method profiling is disabled.|
|KNJ_RESTCLIENT_TIMER (optional)   |"1000", "100"                          |"1000"         |Interval at which requests are sent to the sever, in milliseconds.|
|KNJ_RESTCLIENT_MAX_RETRY(optional)|"3", "2"                               |"3"            |Specifies the retry times when a request fails.                |  
|KNJ_ENABLE_TT (optional)           |"true", "True", "", "False", or not set |not set        |Enables or disables transaction tracking of AAR. By default, transaction tracking is disabled.
|KNJ_LOG_LEVEL (optional)           |"off", "error", "info", "debug", "all" |"error"        |Specifies at which level the log is printed.                                               
|KNJ_SAMPLING (optional)           |1, 10, 100                             |10             |The number of requests based on which a sample is taken. By default, data collector takes one sample of every 10 requests.
|KNJ_MIN_CLOCK_TRACE (optional)      |1, 10, 100                             |0              |If the response time of a request instance exceeds the value of this variable, the data collector collects its method trace. By default, data collector collects method trace.
|KNJ_MIN_CLOCK_STACK (optional)      |1, 10, 100, 1000                       |0              |If the response time of a request instance exceeds the value of this variable, the data collector collects its stack trace. By default, data collector collects stack trace.

