#!/bin/bash

. ./setenv.sh

current=`pwd`

if [ $# -lt 5 ]; then
	echo "Usage: $0 <Ingress URL > <node app path> <enable_deepdive> <enable_methodtrace> <enable_tt>"
	echo "       <Ingress URL>:        http://<ip>:<port>"
	echo "       <enable_deepdive>:    true|false"
	echo "       <enable_methodtrace>: true|false"
	echo "       <enable_tt>:          true|false"
	exit 2;
fi

INGRESS_URL=$1
NODE_APP_PATH=$2
ENABLE_DEEPDIVE=$3
ENABLE_METHODTRACE=$4
ENABLE_TT=$5

if [ ! -d ${DC_AUTOMATION_PATH} ]; then
	echo create path $DC_AUTOMATION_PATH
	mkdir $DC_AUTOMATION_PATH
fi

echo switch current folder to $DC_AUTOMATION_PATH
cd $DC_AUTOMATION_PATH

wget --user $GSA_ACCOUNT --password $GSA_PASS https://rtpgsa.ibm.com/gsa/rtpgsa/projects/i/itm_db2_agent/nodejs/cloudnative
if [ $? -ne 0 ]
then
	echo Failed to fetch DC build index from GSA !
	exit 1;
fi

#find out latest build timestamp
DC_TIMESTAMP=`grep "\/icons\/folder.gif" index.html | awk -F '\<' '{print $3}' | awk -F '>' '{print $2}' | cut -c1-12 | tail -n 1`;
BUILD_URL=https://rtpgsa.ibm.com/gsa/rtpgsa/projects/i/itm_db2_agent/nodejs/cloudnative/${DC_TIMESTAMP}/knj-plugin.tgz

echo Fetch DC build from ${BUILD_URL} ...


rm -f ./index.html
rm -f ./knj-plugin.tgz

echo BUILD_URL=$BUILD_URL
wget --user $GSA_ACCOUNT --password $GSA_PASS $BUILD_URL

if [ $? -ne 0 ]
then
	echo Failed to fetch latest NodeJS DC image from GSA !
	cd $current
	exit 1;
fi

if [ ! -f $DC_AUTOMATION_PATH/knj-plugin.tgz ]
then
	echo Failed to fetch latest NodeJS DC image from GSA !
	cd $current
	exit 1;
fi

if [ ! -d ${NODE_APP_PATH} ]; then
	echo "Node JS application path ${NODE_APP_PATH does not exist!}"
	exit 1;
fi

### uninstall previous plugin if installed
InstalledNodePluginPath=${NODE_APP_PATH}/node_modules/knj-plugin
NodeJSAppProcess=`ps -fC node | grep app | awk -F ' ' '{print $2}'`
if [ -d "$InstalledNodePluginPath" ]
then
	echo "Stop NodeJS application(${NodeJSAppProcess}) ..."
	kill -9 $NodeJSAppProcess

	echo Uninstall knj-plugin ... 
	cd $NODE_APP_PATH
	#npm uninstall knj-plugin
	#rm -fr ./node_modules/knj-plugin
	rm -f ./nodejs_dc.log
	rm -f ./nodejs_restclient.log
	rm -f ./test-config.json
	rm -f ./nohup.out

	echo Remove item from App Gemfile ...
	AppJSfileFullPath=$NODE_APP_PATH/app.js
	TmpAppJSfile=$NODE_APP_PATH/app.tmp
	LastAppJSfile=$NODE_APP_PATH/app.last
	grep -v 'knj-plugin' $AppJSfileFullPath > $TmpAppJSfile
	mv $AppJSfileFullPath $LastAppJSfile
	mv $TmpAppJSfile $AppJSfileFullPath
fi

### Install the new plugin now
echo Install new plugin ...
cd $NODE_APP_PATH
tar xzvf $DC_AUTOMATION_PATH/knj-plugin.tgz
if [ ! -d "./knj-plugin" ]
then
	echo extract knj-plugin failed!
	exit 1
fi

rm -f ./node_modules/knj-plugin/*.js
rm -f ./node_modules/knj-plugin/*.json
rm -fr ./node_modules/knj-plugin/lib
cp -fr ./knj-plugin/* ./node_modules/knj-plugin/
rm -rf ./knj-plugin

echo Prepare for test-config.json ...
TARGET_FILE_NAME=$NODE_APP_PATH/test-config.json
echo "{" >> $TARGET_FILE_NAME
echo "    \"ingressURL\" :  \"${INGRESS_URL}\"," >> $TARGET_FILE_NAME
echo "    \"tenantID\" :  \"6defb2b3-4e44-463b-9731-09c64e7fdb67\"," >> $TARGET_FILE_NAME
echo "    \"metrics\" :  \"metric\"," >> $TARGET_FILE_NAME
echo "    \"AAR\" :  \"aar/middleware\"," >> $TARGET_FILE_NAME
echo "    \"ADR\" :  \"adr/middleware\"" >> $TARGET_FILE_NAME
echo "}" >> $TARGET_FILE_NAME

echo Prepare for plugin environment variables ...
export knj_enableDeepdive=${ENABLE_DEEPDIVE}
export knj_enableMethodTrace=ENABLE_METHODTRACE
export knj_enableTT=ENABLE_TT
export knj_configFile=test-config.json
export knj_loglevel=all
export PORT=3002

echo "Append plugin into App JS file ..."
AppJSfileFullPath=$NODE_APP_PATH/app.js
AppJSfileLAST=$NODE_APP_PATH/app.last
AppJSfileTMP=$NODE_APP_PATH/app.tmp
KNJ_PLUGIN_ITEM="require('./node_modules/knj-plugin/knj_index.js');"
echo $KNJ_PLUGIN_ITEM >> $AppJSfileTMP
cat $AppJSfileFullPath >> $AppJSfileTMP
mv $AppJSfileFullPath $AppJSfileLAST
mv $AppJSfileTMP $AppJSfileFullPath


echo "Start Node JS application ..."
cd $NODE_APP_PATH
nohup node app 1>/dev/null 2>&1 &

### check if dc log file is created
echo "Wait for 20 seconds to check dc calling back!"
sleep 20

NodeAppProcess=`ps -fC node | grep app | awk -F ' ' '{print $2}'`
if [ -z '$NodeAppProcess' ]
then
	echo Failed to start NodeJS App after configuration!
	cd $current
	exit 1
fi

if [ ! -f ${NODE_APP_PATH}/nodejs_dc.log ]
then
	echo ${NODE_APP_PATH}/nodejs_dc.log is not created in 20 seconds!
	cd $current
	exit 1
fi

echo Successfully updated NodeJS DC !
cd $current
exit 0;
