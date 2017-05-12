package automation.test;

import java.io.File;
import java.util.ArrayList;
import java.util.Iterator;

import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Optional;
import org.testng.annotations.Parameters;
import org.testng.annotations.Test;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

import automation.test.util.CmdHelper;
import automation.test.util.OutputParser;
import automation.test.util.PayloadVerifier;

public class NodeJS_AVT_VerifyRESTResponse {

    @BeforeClass
    @Parameters({ "nodejsAppURL" })
    public void accessApp(String nodejsAppURL) {
        String[] cmd = { "curl", nodejsAppURL };

        int ret = CmdHelper.executeCmd(cmd);
        Assert.assertEquals(ret, 0);
    }

    @Test
    @Parameters({ "metric_service_rest_url_appinfo", "metric_rest_query_file_appinfo",
            "metric_payload_desc_filename_appinfo", "header1", "header2" })
    public static void verifyMetricDataAppInfo(String metricRestUrl, String metricSrvRestQueryFileNameAppInfo,
            String descFileName, String header1, @Optional("dummyHeader") String header2) {
        // Query metric data through REST API
        boolean ret = restQuery(metricRestUrl, metricSrvRestQueryFileNameAppInfo, header1, header2);
        Assert.assertTrue(ret);

        // Verify output
        ret = verifyOutput(metricSrvRestQueryFileNameAppInfo, descFileName);
        Assert.assertTrue(ret);
    }

    @Test
    @Parameters({ "metric_service_rest_url_nodeeng", "metric_rest_query_file_nodeeng",
            "metric_payload_desc_filename_nodeeng", "header1", "header2" })
    public static void verifyMetricDataNodeEng(String metricRestUrl, String metricSrvRestQueryFileNameNodeEng,
            String descFileName, String header1, @Optional("dummyHeader") String header2) {
        // Query metric data through REST API
        boolean ret = restQuery(metricRestUrl, metricSrvRestQueryFileNameNodeEng, header1, header2);
        Assert.assertTrue(ret);

        // Verify output
        ret = verifyOutput(metricSrvRestQueryFileNameNodeEng, descFileName);
        Assert.assertTrue(ret);
    }

    @Test
    @Parameters({ "metric_service_rest_url_computeinfo", "metric_rest_query_file_computeinfo",
            "metric_payload_desc_filename_computeinfo", "header1", "header2" })
    public static void verifyMetricDataComputeInfo(String metricRestUrl, String metricSrvRestQueryFileNameComputeInfo,
            String descFileName, String header1, @Optional("dummyHeader") String header2) {
        // Query metric data through REST API
        boolean ret = restQuery(metricRestUrl, metricSrvRestQueryFileNameComputeInfo, header1, header2);
        Assert.assertTrue(ret);

        // Verify output
        ret = verifyOutput(metricSrvRestQueryFileNameComputeInfo, descFileName);
        Assert.assertTrue(ret);
    }

    private static boolean restQuery(String restUrl, String outputFileName, String... headers) {
        boolean succeed = true;

        File file = new File(outputFileName);
        if (file.exists() && file.isFile()) {
            Assert.assertTrue(file.delete());
        }

        ArrayList<String> list = new ArrayList<String>();
        list.add("curl");
        for (String header : headers) {
            if (!header.equals("dummyHeader")) {
                list.add("-H");
                list.add(header);
            }
        }
        list.add(restUrl);
        list.add("-o");
        list.add(outputFileName);
        System.out.print("list: " + list.toString());
        String[] cmd = list.toArray(new String[0]);
        int ret = CmdHelper.executeCmd(cmd);
        if (ret == 0) {
            if (file.exists() && file.isFile()) {
                succeed = true;
            }
        }

        System.out.println("Generate " + file.getPath() + " result: " + succeed);

        return succeed;
    }

    private static boolean verifyOutput(String outputFileName, String descFileName) {
        boolean succeed = true;

        JSONArray jsonArray = OutputParser.parseOutputFromKafkaConsumer(outputFileName);
        @SuppressWarnings("unchecked")
        Iterator<JSONObject> jsonObjIt = jsonArray.iterator();
        while (jsonObjIt.hasNext()) {
            JSONObject jsonObj = jsonObjIt.next();
            boolean result = PayloadVerifier.verifyPayload(jsonObj, CmdHelper.getDescFilePath() + descFileName);
            if (!result) {
                succeed = false;
                break;
            }
        }

        return succeed;
    }

    @Test
    @Parameters({ "aar_service_rest_url", "aar_rest_query_file", "aar_desc_filename", "header1", "header2" })
    public static void verifyAARData(String aarRestUrl, String aarSrvRestQueryFileName, String descFileName,
            String header1, @Optional("dummyHeader") String header2) {
        // Query metric data through REST API
        boolean ret = restQuery(aarRestUrl, aarSrvRestQueryFileName, header1, header2);
        Assert.assertTrue(ret);

        // Verify output
        ret = verifyOutput(aarSrvRestQueryFileName, descFileName);
        Assert.assertTrue(ret);
    }

    @Test
    @Parameters({ "adr_service_rest_url", "adr_rest_query_file", "adr_desc_filename", "header1", "header2" })
    public static void verifyADRData(String adrRestUrl, String adrSrvRestQueryFileName, String descFileName,
            String header1, @Optional("dummyHeader") String header2) {
        // Query metric data through REST API
        boolean ret = restQuery(adrRestUrl, adrSrvRestQueryFileName, header1, header2);
        Assert.assertTrue(ret);

        // Verify output
        ret = verifyOutput(adrSrvRestQueryFileName, descFileName);
        Assert.assertTrue(ret);
    }

    public static void main(String[] args) {
        // Metric for appinfo
        String metricSrvRestQueryFileNameAppInfo = "/Users/IBM_ADMIN/Work/MyTask/V8 Automation/nodejs_payloads/rest.metric.appinfo.json";
        String descFileName = "rest_nodejs_metric_payload_desc_appinfo.json";
        boolean ret = verifyOutput(metricSrvRestQueryFileNameAppInfo, descFileName);
        System.out.println("Verification result is " + ret);

        // Metric for nodeeng
        // String metricSrvRestQueryFileNameNodeeng =
        // "/Users/IBM_ADMIN/Work/MyTask/V8 Automation/nodejs_payloads/rest.metric.nodeeng.json";
        // String descFileName = "rest_nodejs_metric_payload_desc_nodeeng.json";
        // boolean ret = verifyOutput(metricSrvRestQueryFileNameNodeeng,
        // descFileName);
        // System.out.println("Verification result is " + ret);

        // Metric for compute info
        // String metricSrvRestQueryFileNameComputeinfo =
        // "/Users/IBM_ADMIN/Work/MyTask/V8 Automation/nodejs_payloads/rest.metric.computeinfo.json";
        // String descFileName =
        // "rest_nodejs_metric_payload_desc_computeinfo.json";
        // boolean ret = verifyOutput(metricSrvRestQueryFileNameComputeinfo,
        // descFileName);
        // System.out.println("Verification result is " + ret);

        // AAR
//        System.out.println("Verify AAR...");
//        String aarQueryFileName = "/Users/IBM_ADMIN/Work/MyTask/V8 Automation/nodejs_payloads/rest.aar.middleware.json";
//        String descFileName = "nodejs_aar_payload_desc.json";
//        boolean ret = verifyOutput(aarQueryFileName, descFileName);
//        System.out.println("Verification result is " + ret);

        // ADR
        // String adrQueryFileName =
        // "/Users/IBM_ADMIN/Work/MyTask/V8 Automation/nodejs_payloads/rest.adr.middleware.json";
        // String descFileName = "nodejs_adr_payload_desc.json";
        // boolean ret = verifyOutput(adrQueryFileName, descFileName);
        // System.out.println("Verification result is " + ret);

    }

}
