#!/bin/bash

# Retrieve the current path
cd `dirname $0`
CURRENT_PATH=`pwd`

. $CURRENT_PATH/setenv.sh

LIB_PATH=$CURRENT_PATH/../lib
CONFIG_PATH=$CURRENT_PATH/../config
OUTPUT_PATH=$CURRENT_PATH/../test-output-avt-bm

java -cp $LIB_PATH/testng-6.9.14-SNAPSHOT.jar:$LIB_PATH/jcommander-1.48.jar:$LIB_PATH/NodeDC_CVT_automation.jar \
org.testng.TestNG $CONFIG_PATH/testng_AVT_BM.xml -d $OUTPUT_PATH 
