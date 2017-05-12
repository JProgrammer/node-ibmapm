#!/bin/bash

# Retrieve the current path
cd `dirname $0`
CURRENT_PATH=`pwd`

. $CURRENT_PATH/setenv.sh

if [ -d $NODEJS_APP_PATH/UT ]
then
  rm -rf $NODEJS_APP_PATH/UT/*
else
  mkdir $NODEJS_APP_PATH/UT
fi

BUILD_NAME=`echo $NODEJS_DC_BUILD | awk -F'/' '{print $NF}'`
cp $NODEJS_APP_PATH/$BUILD_NAME $NODEJS_APP_PATH/UT

expect <<-EOF
set time 30

spawn scp -r $NODEJS_APP_PATH/UT $GSA_ACCOUNT@$GSA_HOSTNAME:$NODEJS_GSA_PUBLISH_DIR
expect {
  "password:" {
    send "$GSA_PASS\r"
	wait 10
  } "yes/no)?" {
    send "yes\r"
    set timeout -1
  } -re . {
    exp_continue
  } 
}

EOF