# Configuring the data collector for local applications

## Before you begin

If you want to connect the data collector to your on-premises Cloud APM server and you haven't configured the downloaded image during server installation, make sure that you have prepared the data collector package before you continue with the following procedure. For more details, see [Configuring the installation images](https://www.ibm.com/support/knowledgecenter/SSHLNR_8.1.4/com.ibm.pm.doc/install/install_agent_preconfig.htm).

## Procedure

To configure your Node.js data collector for your local application, complete the following steps:  

 1. In the home directory of your Node.js application, run `npm install ibmapm --save` to install the ibmapm package.

 2. In the beginning of your application main file, add `require('ibmapm');`.     
    > Tip: If you start your application by running the `node app.js` command, `app.js` is the main file of your application.

 3. In the `node_modules/ibmapm/etc/config.properties` file, set the following variables:  
     ```
     APPLICATION_NAME=my_app //Optional.
     ```

    The `APPLICATION_NAME` must be unique on the same host.  

 4. In the `node_modules/ibmapm/etc/global.environment` file, set the following environment variables:  
     ```
    APM_BM_GATEWAY_URL=https://APM_server_ip/hostname:443
    APM_KEYFILE=keyfile.p12
    APM_KEYFILE_PSWD=base_64_encrypted_password
     ```

 5. Copy the server key file, for example, `keyfile.p12`, to the `node_modules/ibmapm/etc` directory.

 6. Restart the Node.js application.

**Parent topic:** [Node.js Data Collector for IBM Application Performance Management (APM)](../README.md)
