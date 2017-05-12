export PATH=${JAVA_HOME}/bin:$PATH
export TESTNG_PATH=./testNG

java -Xms512m -Xmx1024m -cp ${TESTNG_PATH}/testng-6.9.14-SNAPSHOT.jar:${TESTNG_PATH}/jcommander-1.48.jar:../NodeDC_CVT_automation.jar org.testng.TestNG ../testng.xml 
