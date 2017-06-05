#!/bin/bash

export JAVA_HOME=/opt/jre
export PATH=$JAVA_HOME/bin:$PATH
export DC_AUTOMATION_PATH=/opt/automation_rubydc_workspace
export GSA_ACCOUNT=songhj
export GSA_PASS=zhu22jie

current=`pwd`
cd $DC_AUTOMATION_PATH

wget --user $GSA_ACCOUNT --password $GSA_PASS https://rtpgsa.ibm.com/gsa/rtpgsa/projects/a/apmui/build/daily/RubyBluemix/
if [ $? -ne 0 ]
then
	echo Failed to fetch DC build index from GSA !
	exit 1;
fi

#find out latest build timestamp
DC_TIMESTAMP=`grep "\/icons\/folder.gif" index.html | awk -F '\<' '{print $3}' | awk -F '>' '{print $2}' | cut -c1-12 | tail -n 1`;
BUILD_URL=https://rtpgsa.ibm.com/gsa/rtpgsa/projects/a/apmui/build/daily/RubyBluemix/${DC_TIMESTAMP}/RubyDC_CVT_automation.tar.gz

echo Fetch DC build from ${BUILD_URL} ...

rm -f ./index.html
rm -f ./RubyDC_CVT_automation.tar.gz

echo BUILD_URL=$BUILD_URL
wget --user $GSA_ACCOUNT --password $GSA_PASS $BUILD_URL

if [ $? -ne 0 ]
then
	echo Failed to fetch latest Ruby DC automation package from GSA !
	cd $current
	exit 1;
fi

if [ ! -f $DC_AUTOMATION_PATH/RubyDC_CVT_automation.tar.gz ]
then
	echo Failed to fetch latest Ruby DC autmomation package from GSA !
	cd $current
	exit 1;
fi

echo Successfully got Ruby DC automation package !
cd $current
exit 0;
