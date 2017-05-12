#!/bin/bash

# Retrieve the current path
cd `dirname $0`
CURRENT_PATH=`pwd`

. $CURRENT_PATH/setenv.sh

echo "CURRENT_PATH=$CURRENT_PATH"
cd $CURRENT_PATH

if [ $# -lt 5 ]; then
	echo "Usage: $0 <kube node ip/hostname > <username> <password> <topic> <output filename> [--from-beginning]"
	exit 2;
fi

echo "-----------------enter $0-------------------"

echo "             Kube node is $1"
echo " username of Kube node is $2"
echo " password of Kube node is ******"
echo " 		       topic is $4"
echo " 	     output filename is $5"

FROM_BEGINNING_FLAG=
if [ $# -gt 5 ]
then
	FROM_BEGINNING_FLAG="--from-beginning"
	echo FROM_BEGINNING_FLAG is set
fi

echo FROM_BEGINNING_FLAG is $FROM_BEGINNING_FLAG

echo "execute ./scp.exp ./get_messages.sh $2@$1:/tmp/ $3"
./scp.exp ./get_messages.sh $2@$1:/tmp/ $3
echo "return $?"

echo "execute ./ssh_exec.exp $1 $2 $3 "chmod 777 /tmp/get_messages.sh""
./ssh_exec.exp $1 $2 $3 "chmod 777 /tmp/get_messages.sh"
echo "return $?"

echo "execute ./scp.exp ./kafka-test.sh $2@$1:/tmp/ $3"
./scp.exp ./kafka-test.sh $2@$1:/tmp/ $3
echo "return $?"

echo "execute ./ssh_exec.exp $1 $2 $3 "chmod 777 /tmp/kafka-test.sh""
./ssh_exec.exp $1 $2 $3 "chmod 777 /tmp/kafka-test.sh"
echo "return $?"

echo "Start to execute below command on $1:"
echo "       /tmp/get_messages.sh $4 /tmp/output.json $FROM_BEGINNING_FLAG"

./ssh_exec.exp $1 $2 $3 "cd /tmp;./get_messages.sh $4 /tmp/output.json $FROM_BEGINNING_FLAG"
echo "return $?"

./scp.exp $2@$1:/tmp/output.json $5 $3
./ssh_exec.exp $1 $2 $3 "rm -f /tmp/output.json"

if [ -f $5 ]; then
		echo Copied output back!
        	echo "-----------------exit $0-------------------"       
        	exit 0
else
       	echo "Didn't copy output back!"  
       	echo "-----------------exit $0-------------------"       
       	exit -1
fi
