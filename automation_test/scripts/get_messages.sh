#!/bin/bash

if [ $# -lt 2 ]; then
	echo "Usage: $0 <kafka topic> <output file>"
	exit 2;
fi

FROM_BEGINNING_FLAG=
if [ $# -ge 3 ]; then
	FROM_BEGINNING_FLAG="${3}"
fi

echo "-----------------enter $0-------------------"

echo "Start query kafka service on topic $1"
echo "output file is $2"

pwd=`pwd`
echo "pwd = ${pwd}"

chmod 755 kafka-test.sh

id=$(docker ps -f name=k8s_kafka-1 -f status=running -q)
docker cp kafka-test.sh  ${id}:/tmp/
echo Copied file kafka-test.sh to ${id}

docker exec -i  ${id}  /bin/bash /tmp/kafka-test.sh $1 /tmp/$1.txt ${FROM_BEGINNING_FLAG}
CMD_RESULT="$?"
echo "execution result: ${CMD_RESULT}"
  
if [ $CMD_RESULT -eq 0 ]; then
	docker exec -i  ${id} cat /tmp/$1.txt > $2
	sleep 5
fi
  
echo "-----------------exit $0-------------------"
exit ${CMD_RESULT}
