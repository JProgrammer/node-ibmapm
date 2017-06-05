#!/bin/bash

# Retrieve the current path
cd `dirname $0`
CURRENT_PATH=`pwd`

. $CURRENT_PATH/setenv.sh

# Check NodeJS app status. If it is running, stop it.
NodeAppProcess=`ps -fC node | grep app | awk -F ' ' '{print $2}'`
if [ -z '$NodeAppProcess' ]
then
	echo NodeJS App is running. Stop it!
	kill -9 $NodeAppProcess
fi

# Download NodeJS DC build
NODEJS_APP_PATH=$CURRENT_PATH/../nodejsApp
ls $NODEJS_APP_PATH/ibmapm.tgz
if [ $? -eq 0 ]
then
    rm -rf $NODEJS_APP_PATH/ibmapm.tgz
fi

cd $NODEJS_APP_PATH
wget --user $GSA_ACCOUNT --password $GSA_PASS $NODEJS_DC_BUILD_UT
if [ $? -ne 0 ]
then
    echo "Failed to download NodeJS DC build!"
	exit 1
fi

unzip -o simpleApp.zip

NODEJC_DC_BUILD_NAME=`echo $NODEJS_DC_BUILD | awk -F'/' '{print $NF}'`
npm install $NODEJC_DC_BUILD_NAME
if [ $? -ne 0 ]
then
    echo "Failed to install NodeJS DC!"
	exit 1
fi

grep "require ('ibmapm');" ./app.js
if [ $? -ne 0 ]
then
    sed -i "1i\require ('ibmapm');" ./app.js
fi

echo -e "{\n\
        \"ingressURL\" : \"$INGRESS_URL\",\n\
        \"tenantID\" : \"$TENANT_ID\"\n\
}" > ./config.json

echo "Start NodeJS app..."
node app &

