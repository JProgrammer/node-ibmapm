package automation.test;

import org.testng.Assert;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Parameters;
import org.testng.annotations.Test;

import automation.test.util.CmdHelper;
import automation.test.util.KafkaPayloadTestBase;

public class NodeJS_BAM_CVT_VerifyKafkaPayload extends KafkaPayloadTestBase{
//    @BeforeTest
//    @Parameters({ "dc_node_ip", "dc_node_user", "dc_node_pass", "ingress_url", "nodejs_app_path", "enable_deepdive",
//            "enable_methodtrace", "enable_tt" })
//    public void refreshNodeJSDC(String dcIP, String dcUser, String dcPass, String ingress_url, String app_path,
//            String deepdiveFlag, String methodtraceFlag, String ttFlag) {
//        String script_full_path = CmdHelper.getScriptPath() + "/remote_exec.sh";
//        String tmpStr = ingress_url + " " + app_path + " " + deepdiveFlag + " " + methodtraceFlag + " " + ttFlag;
//        String[] cmd = { "sudo", "-u", "root", script_full_path, dcIP, dcUser, dcPass, "./update_dc.sh", tmpStr };
//
//        int ret = CmdHelper.executeCmd(cmd);
//        Assert.assertEquals(ret, 0);
//    }
    
    @BeforeTest
    @Parameters({ "nodejsAppIP", "nodejsAppPort" })
    public void accessApp(String nodejsAppIP, String nodejsAppPort) {
        String[] cmd = { "curl", "http://" + nodejsAppIP + ":" + nodejsAppPort };

        int ret = CmdHelper.executeCmd(cmd);
        Assert.assertEquals(ret, 0);
    }
    
	@Test
	@Parameters({"metric_payload_appinfo_desc_filename","resource_type_metric_appinfo"})
	public void verifyMetricData_appinfo(String descFileName, String type) {
		boolean result = verifyPayloadFromKafkaConsumerOutput(type, "metric.json", descFileName);
		Assert.assertEquals(result, true);
	}
	
	@Test
	@Parameters({"metric_payload_engineStats_desc_filename","resource_type_metric_engineStats"})
	public void verifyMetricData_engineStats(String descFileName, String type) {
		boolean result = verifyPayloadFromKafkaConsumerOutput(type, "metric.json", descFileName);
		Assert.assertEquals(result, true);
	}
	
	@Test
	@Parameters({"provider_payload_verification_desc_filename","resource_type_provider"})
	public void verifyProviderData(String descFileName, String type) {
		boolean result = verifyPayloadFromKafkaConsumerOutput(type, "providers.json", descFileName);
		Assert.assertEquals(result, true);
	}
	
	@Test
	@Parameters({"resource_nodeengine_payload_verification_desc_filename", "resource_type_nodeengine"})
	public void verifyResourceData_nodeengine(String descFileName, String type) {
		boolean result = verifyPayloadFromKafkaConsumerOutput(type, "resources.json", descFileName);
		Assert.assertEquals(result, true);
	}
	
	@Test
	@Parameters({"resource_npm_payload_verification_desc_filename", "resource_type_npm"})
	public void verifyResourceData_npm(String descFileName, String type) {
		boolean result = verifyPayloadFromKafkaConsumerOutput(type, "resources.json", descFileName);
		Assert.assertEquals(result, true);
	}
	
	@Test
	@Parameters({"resource_nodeapplication_payload_verification_desc_filename", "resource_type_nodeapplication"})
	public void verifyResourceData_nodeapplication(String descFileName, String type) {
		boolean result = verifyPayloadFromKafkaConsumerOutput(type, "resources.json", descFileName);
		Assert.assertEquals(result, true);
	}
	
	@Test
	@Parameters({"resource_compute_payload_verification_desc_filename", "resource_type_compute"})
	public void verifyResourceData_compute(String descFileName, String type) {
		boolean result = verifyPayloadFromKafkaConsumerOutput(type, "resources.json", descFileName);
		Assert.assertEquals(result, true);
	}
	
	@Test
	@Parameters({"aar_payload_verification_desc_filename", "resource_type_aar"})
	public void verifyAARData(String descFileName, String type) {
		boolean result = verifyPayloadFromKafkaConsumerOutput(type, "aar.middleware.json", descFileName);
		Assert.assertEquals(result, true);
	}
	
    @Test
    @Parameters({ "adr_payload_verification_desc_filename", "resource_type_adr" })
    public void verifyADRData(String descFileName, String type) {
        boolean result = verifyPayloadFromKafkaConsumerOutput(type, "adr.middleware.json", descFileName);
        Assert.assertEquals(result, true);
    }
}
