#!/bin/bash

# Retrieve the current path
cd `dirname $0`
CURRENT_PATH=`pwd`

. $CURRENT_PATH/setenv.sh

cd $CURRENT_PATH/../nodejsApp

# Download NodeJS DC build
ls ./ibmapm.tgz
if [ $? -eq 0 ]
then
    rm -rf ./ibmapm.tgz
fi

wget --user $GSA_ACCOUNT --password $GSA_PASS $NODEJS_DC_BUILD_UT
if [ $? -ne 0 ]
then
    echo "Failed to download NodeJS DC build!"
	exit 1
fi

tar -zxvf ibmapm.tgz

grep "require ('./ibmapm');" ./app.js
if [ $? -ne 0 ]
then
    sed -i "1i\require ('ibmapm');" ./app.js
fi

unzip -o simpleApp.zip

cf login -u $BLUEMIX_ACCOUNT -p $BLUEMIX_PASS -a $BLUEMIX_URL
cf push
