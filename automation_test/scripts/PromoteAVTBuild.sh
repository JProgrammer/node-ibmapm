#!/bin/bash

# Retrieve the current path
cd `dirname $0`
CURRENT_PATH=`pwd`

. $CURRENT_PATH/setenv.sh

if [ -d $NODEJS_APP_PATH/AVT ]
then
  rm -rf $NODEJS_APP_PATH/AVT/*
else
  mkdir $NODEJS_APP_PATH/AVT
fi

BUILD_NAME=`echo $NODEJS_DC_BUILD | awk -F'/' '{print $NF}'`
cp $NODEJS_APP_PATH/$BUILD_NAME $NODEJS_APP_PATH/AVT

expect <<-EOF
set time 30

spawn scp -r $NODEJS_APP_PATH/AVT $GSA_ACCOUNT@$GSA_HOSTNAME:$NODEJS_GSA_PUBLISH_DIR
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