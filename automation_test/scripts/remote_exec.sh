#!/bin/bash

if [ $# -lt 4 ]; then
	echo "Usage: $0 <remote node ip/hostname > <username> <password> <cmd_file> <args_of_cmd>"
	exit 2;
fi

echo "-----------------enter $0-------------------"

echo "             remote node is $1"
echo "username of remote node  is $2"
echo "password of remote node  is ******"
echo "                command  is $4"
echo "         args_of_command is $5"

echo "execute ./scp.exp $4 $2@$1:/tmp/ $3"
./scp.exp $4 $2@$1:/tmp/ $3
echo "return $?"

cmd_file=$4
cmd_file_name=${cmd_file##*/}
echo "execute ./ssh_exec.exp $1 $2 $3 "chmod 777 /tmp/${cmd_file_name}""
./ssh_exec.exp $1 $2 $3 "chmod 777 /tmp/${cmd_file_name}"
echo "return $?"

echo "execute ./scp.exp ./setenv.sh $2@$1:/tmp/ $3"
./scp.exp ./setenv.sh $2@$1:/tmp/ $3
echo "return $?"

echo "execute ./ssh_exec.exp $1 $2 $3 "chmod 777 /tmp/setenv.sh""
./ssh_exec.exp $1 $2 $3 "chmod 777 /tmp/setenv.sh"
echo "return $?"

./scp.exp ./instrumenter_settings.rb $2@$1:/tmp/ $3
./ssh_exec.exp $1 $2 $3 "chmod 777 /tmp/instrumenter_settings.rb"

echo "Start to execute below command on $1:"
echo "       /tmp/${cmd_file_name} ${5}"

./ssh_exec.exp $1 $2 $3 "cd /tmp;./${cmd_file_name} ${5}"
return_value=$?

./ssh_exec.exp $1 $2 $3 "rm -f /tmp/setenv.sh"
./ssh_exec.exp $1 $2 $3 "rm -f /tmp/${cmd_file_name}"
./ssh_exec.exp $1 $2 $3 "rm -f /tmp/intrumenter_settings.rb"

echo "-----------------exit $0 with $return_value-------------------"

exit $return_value
