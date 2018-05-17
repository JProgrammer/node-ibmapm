[![Codacy Badge](https://api.codacy.com/project/badge/Grade/3f8e27ab77d341e8a87ec3f9a4cb7f0c)](https://www.codacy.com/app/shiyanf/node-ibmapm?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=IBM-APM/node-ibmapm&amp;utm_campaign=Badge_Grade)
[![Build Status](https://travis-ci.org/IBM-APM/node-ibmapm.svg?branch=master)](https://travis-ci.org/IBM-APM/node-ibmapm)
[![codebeat badge](https://codebeat.co/badges/f7a857b8-a6c0-49e9-994d-1c1cc10a37f9)](https://codebeat.co/projects/github-com-ibm-apm-node-ibmapm-master)
[![codecov](https://codecov.io/gh/IBM-APM/node-ibmapm/branch/master/graph/badge.svg)](https://codecov.io/gh/IBM-APM/node-ibmapm)
Table of Contents
=================
* [Overview](#overview)
* [Downloading the latest ibmapm package](#downloading-the-latest-ibmapm-package) (internal use only)
* [Configuring the Node.js application monitoring using the Winterfell server](#configuring-the-nodejs-application-monitoring-using-the-winterfell-server)
    * [Monitoring Node.js applications in IBM Cloud Private](#monitoring-nodejs-applications-in-ibm-cloud-private)
    * [Monitoring on-premises Node.js applications](#monitoring-on-premises-nodejs-applications)
* [Configuring Node.js application monitoring using the Cloud APM v8 server](#configuring-nodejs-application-monitoring-using-the-cloud-apm-v8-server)
* [Configuring Node.js application monitoring using the BAM server](#configuring-nodejs-application-monitoring-using-the-bam-server)
## Overview
The Node.js data collector can provide you with visibility and control of your Node.js applications, and help you ensure optimal performance and efficient use of resources. You can reduce and prevent application crashes and slowdowns around the clock, as the data collector assists you in detecting, diagnosing and isolating performance issues.

The Node.js data collector helps you to manage the performance and availability of the following:

- Node.js applications in IBM Cloud Private
- Node.js applications in IBM Cloud (aka Bluemix)
- Local Node.js applications

This data collector can be configured to connect to the Winterfell server, the IBM Cloud Application Performance Management (Cloud APM v8) server, or the IBM Cloud Availability Monitoring (BAM) server.

## Downloading the latest ibmapm package
To get the up-to-date ibmapm package, which is a required dependency that you need for Node.js application monitoring, go to https://rtpgsa.ibm.com/projects/i/itm_db2_agent/nodejs/cloudnative/NPMCD/latest/.

This package is for internal testing.


## Configuring the Node.js application monitoring using the Winterfell server
When the data collector is configured to connect to the Winterfell server, you can use it to monitor both the Node.js applications in IBM Cloud Private and on-premises Liberty applications.

### Monitoring Node.js applications in IBM Cloud Private
To monitor Node.js applications in IBM Cloud Private, different procedures apply depending on whether your Java-based microservices are created with IBM Microservice Builder or not.

For internal testing purpose, download the latest data collector build and follow the [simplified procedure](readme-topics/nodejsdc-internal.md).

Formal documentation is still in draft and will be published on the IBM Knowledge Center at GA of Winterfell release. For the always up-to-date internal doc for testing, see [Winterfell Knowledge Center](https://www-03preprod.ibm.com/support/knowledgecenter/SS8G7U_18.2.0/com.ibm.icam.doc/content/deploy_dc_intro.htm) (preproduction).


### Monitoring on-premises Node.js applications
To monitor on-premises Node.js applications, follow the instructions as documented in [Configuring on-premises Node.js applications monitoring using the Winterfell server](readme-topics/nodejsdc-onprem-winterfell.md).

## Configuring Node.js application monitoring using the Cloud APM v8 server
You can use the Node.js data collector, which is delivered in the Cloud APM v8 product, to monitor your Liberty applications running locally, in IBM Cloud, or in IBM Cloud Private. The data collector is configured to connect to the Cloud APM v8 server.

Different procedures apply depending on whether you are using Cloud APM (SaaS) or Cloud APM, Private (on-premises).

- If you are a Cloud APM (SaaS) user, complete the following procedures:
> - [Configuring the data collector for IBM Cloud applications](https://www.ibm.com/support/knowledgecenter/SSMKFH/com.ibm.apmaas.doc/install/bluemix_nodejs_config_dc.htm)
> - [Configuring the data collector for local applications](https://www.ibm.com/support/knowledgecenter/SSMKFH/com.ibm.apmaas.doc/install/nodejs_config_dc.htm)
> - [Configuring method trace and transaction tracking](readme-topics/nodejsdc_mt_tt.md)

- If you are a Cloud APM, Private (on-premises) user, complete the following procedures:
> - [Configuring the data collector for Bluemix applications](https://www.ibm.com/support/knowledgecenter/SSHLNR_8.1.4/com.ibm.pm.doc/install/bluemix_nodejs_config_dc.htm)
> - [Configuring the data collector for local applications](https://www.ibm.com/support/knowledgecenter/SSHLNR_8.1.4/com.ibm.pm.doc/install/nodejs_config_dc.htm)
> - [Configuring the data collector for applications in IBM Cloud Private](readme-topics/nodejsdc_icp_apm_server.md)
> - [Configuring method trace and transaction tracking](readme-topics/nodejsdc_mt_tt.md)

You can also use the supported variables to change the default behavior of data collection. For more information, see [Advanced configuration](readme-topics/nodejs_dc_advanced_config.md).

## Configuring Node.js application monitoring using the BAM server

To connect the data collector to a BAM server, choose one of the following options:

- [Bind the Availability Monitoring service to the data collector](readme-topics/connect_bam_service.md)

- [Set the environment variables directly](readme-topics/set_var_bam.md)
