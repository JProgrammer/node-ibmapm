package automation.test.util;

import java.util.HashMap;
import java.util.Map;
import java.util.StringTokenizer;

import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Parameters;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class KafkaPayloadTestBase {
	public static Map<String, JSONArray> resourceID_type_list = null;
	public static String originID = null;
	public static String providerPayloadsFileName = null;
	public static String resourcePayloadsFileName = null;
	public static String metricPayloadsFileName = null;
	public static String aarPayloadsFileName = null;
	public static String adrPayloadsFileName = null;
	
	@BeforeClass
	@Parameters({"kafka_node","kafka_node_username", "kafka_node_password","resource_payload_properties", "provider_payload_properties"})
	public static void init(String node, String user, String password, String resource_properties_file, String provider_properties_file) {
		
		JSONObject resource_properties = JSONTool.parseJSONObject(CmdHelper.getDescFilePath() + resource_properties_file);
		JSONObject provider_properties = JSONTool.parseJSONObject(CmdHelper.getDescFilePath() + provider_properties_file);
		Assert.assertEquals(resource_properties==null, false);
		Assert.assertEquals(provider_properties==null, false);
		
		providerPayloadsFileName = CmdHelper.fetchKafkaConsumerOutputByTopic(node, user, password, "providers.json");
        Assert.assertEquals(providerPayloadsFileName==null, false);
        
        resourcePayloadsFileName = CmdHelper.fetchKafkaConsumerOutputByTopic(node, user, password, "resources.json");
        Assert.assertEquals(resourcePayloadsFileName==null, false);
        
        metricPayloadsFileName = CmdHelper.fetchKafkaConsumerOutputByTopic(node, user, password, "metric.json");

        aarPayloadsFileName = CmdHelper.fetchKafkaConsumerOutputByTopic(node, user, password, "aar.middleware.json");

        adrPayloadsFileName = CmdHelper.fetchKafkaConsumerOutputByTopic(node, user, password, "adr.middleware.json");
        
        originID = OutputParser.fetchSpecificOriginIDFromResourcePayload(
        		resourcePayloadsFileName, 
        		providerPayloadsFileName, 
        		resource_properties.toString(), 
        		provider_properties.toString());
        Assert.assertEquals(originID==null||originID.isEmpty(), false);	
        
        resourceID_type_list = OutputParser.fetchSpecificResourceIDsFromResourcePayload(
        		resourcePayloadsFileName, 
        		providerPayloadsFileName, 
        		resource_properties.toString(), 
        		provider_properties.toString());
        Assert.assertEquals(resourceID_type_list==null||resourceID_type_list.size()>0, true);
	}
	
//	@AfterClass
//	public static void Cleanup() {
//		CmdHelper.deleteFile(providerPayloadsFileName);
//		CmdHelper.deleteFile(resourcePayloadsFileName);
//		CmdHelper.deleteFile(metricPayloadsFileName);
//		CmdHelper.deleteFile(aarPayloadsFileName);
//		CmdHelper.deleteFile(adrPayloadsFileName);
//	}
	
	public static boolean verifyPayloadFromKafkaConsumerOutput(String type, String topic, String verificationDescFileName) {
		StringTokenizer st = new StringTokenizer(type, ",");
		JSONArray typeArray = new JSONArray();
		while(st.hasMoreElements())
			typeArray.add(st.nextElement());
		
		if(typeArray.isEmpty()) {
			if(!topic.equals("providers.json") && !topic.equals("adr.middleware.json")) {
				System.out.println("Cannot parse type  " + type);
				return false;
			}
		}
		
		String resourceID = getResourceIDByType(typeArray);
		if(resourceID == null || resourceID.isEmpty()) {
			if(!topic.equals("providers.json") && !topic.equals("adr.middleware.json")) {
				System.out.println("Cannot identify resource id for type  " + type);
				return false;
			}
		}
        
        if(topic.equals("metric.json")) {
        	Assert.assertEquals(metricPayloadsFileName==null, false);
        	
        	JSONArray payloads = OutputParser.getMetricPayloadsByResourceID(metricPayloadsFileName, resourceID);
        	if(payloads == null || payloads.isEmpty()) {
    			System.out.println("Did not get payload for topic  " + topic + " and resourceID " + resourceID);
    			return false;
        	}
        	
        	for(int i = 0 ; i < payloads.size(); i ++) {
        		JSONObject payload = (JSONObject)payloads.get(0);
        	
        		boolean isTrue = PayloadVerifier.verifyPayload(payload, CmdHelper.getDescFilePath() + verificationDescFileName);
        		if(isTrue)
        			return true;
        	}
        	return false;
        }
        else if(topic.equals("aar.middleware.json")) {
        	Assert.assertEquals(aarPayloadsFileName==null, false);
        	
        	JSONArray payloads = OutputParser.getAARPayloadsByResourceID(aarPayloadsFileName, resourceID);
        	if(payloads == null || payloads.isEmpty()) {
    			System.out.println("Did not get payload for topic  " + topic + " and resourceID " + resourceID);
    			return false;
        	}
        	
        	for(int i = 0 ; i < payloads.size(); i ++) {
        		JSONObject payload = (JSONObject)payloads.get(0);
        	
        		boolean isTrue = PayloadVerifier.verifyPayload(payload, CmdHelper.getDescFilePath() + verificationDescFileName);
        		if(isTrue)
        			return true;
        	}
        	return false;
        }
        else if(topic.equals("adr.middleware.json")) {
        	Assert.assertEquals(adrPayloadsFileName==null, false);
        	
        	JSONArray payloads = OutputParser.getADRPayloadsByOriginID(adrPayloadsFileName, originID);
        	if(payloads == null || payloads.isEmpty()) {
    			System.out.println("Did not get payload for topic  " + topic + " and resourceID " + originID);
    			return false;
        	}
        	
        	for(int i = 0 ; i < payloads.size(); i ++) {
        		JSONObject payload = (JSONObject)payloads.get(0);
        	
        		boolean isTrue = PayloadVerifier.verifyPayload(payload, CmdHelper.getDescFilePath() + verificationDescFileName);
        		if(isTrue)
        			return true;
        	}
        	return false;
        }
        else if(topic.equals("providers.json")) {
        	Assert.assertEquals(providerPayloadsFileName==null, false);
        	
        	JSONArray payloads = OutputParser.getProvidersPayloadsByOriginID(providerPayloadsFileName, originID);
        	if(payloads == null || payloads.isEmpty()) {
    			System.out.println("Did not get payload for topic  " + topic + " and originID " + originID);
    			return false;
        	}
        	
        	for(int i = 0 ; i < payloads.size(); i ++) {
        		JSONObject payload = (JSONObject)payloads.get(0);
        	
        		boolean isTrue = PayloadVerifier.verifyPayload(payload, CmdHelper.getDescFilePath() + verificationDescFileName);
        		if(isTrue)
        			return true;
        	}
        	return false;
        }
        else if(topic.equals("resources.json")) {
        	Assert.assertEquals(resourcePayloadsFileName==null, false);
        	
        	JSONArray payloads = OutputParser.getResourcesPayloadsByOriginIDAndType(resourcePayloadsFileName, resourceID, typeArray);
        	if(payloads == null || payloads.isEmpty()) {
    			System.out.println("Did not get payload for topic  " + topic + " and originID " + originID + " and type " + type);
    			return false;
        	}
        	
        	for(int i = 0 ; i < payloads.size(); i ++) {
        		JSONObject payload = (JSONObject)payloads.get(0);
        	
        		boolean isTrue = PayloadVerifier.verifyPayload(payload, CmdHelper.getDescFilePath() + verificationDescFileName);
        		if(isTrue)
        			return true;
        	}
        	return false;
        }
        else {
        	System.out.println("Invalid  topic " + topic);
			return false;
        }
	}
	
	private static String getResourceIDByType(JSONArray type) {
		if(resourceID_type_list == null) {
			return null;
		}
		
		for(Map.Entry<String, JSONArray> entry: resourceID_type_list.entrySet()) {
			String resourceID = entry.getKey();
			JSONArray typeJSON = entry.getValue();
			Map<String,String> typeMap = new HashMap<String,String>();
			
			for(int i = 0 ; i < typeJSON.size() ; i ++) {
				typeMap.put(typeJSON.get(i).toString(), "");
			}
			
			boolean matched=true;
			for(int i = 0 ; i < type.size() ; i ++) {
				if(!typeMap.containsKey(type.get(i))) {
					matched=false;
				}
			}
			
			if(matched)
				return resourceID;
		}
		
		return null;
	}
	
	//////
	
	/////
	public static void main(String args[]) {
		String descPath = "/Users/IBM_ADMIN/workspace_nodejsDC/JavaProj_automation_nodejs/payloads_desc/";
		String resource_properties_file = "resource_payload_properties.json";
		String provider_properties_file = "providers_payload_properties.json";
		JSONObject resource_properties = JSONTool.parseJSONObject(descPath + resource_properties_file);
		JSONObject provider_properties = JSONTool.parseJSONObject(descPath + provider_properties_file);
		String payloads_path="/Users/IBM_ADMIN/Work/MyTask/V8 Automation/nodejs_payloads/";
		providerPayloadsFileName = payloads_path + "providers.json";
        resourcePayloadsFileName = payloads_path + "resources.json";
        metricPayloadsFileName = payloads_path + "metric.json";
        aarPayloadsFileName = payloads_path + "aar.middleware.json";
        adrPayloadsFileName = payloads_path + "adr.middleware.json";
        
        originID = OutputParser.fetchSpecificOriginIDFromResourcePayload(
        		resourcePayloadsFileName, 
        		providerPayloadsFileName, 
        		resource_properties.toString(), 
        		provider_properties.toString());
        Assert.assertEquals(originID==null||originID.isEmpty(), false);	
        
        resourceID_type_list = OutputParser.fetchSpecificResourceIDsFromResourcePayload(
        		resourcePayloadsFileName, 
        		providerPayloadsFileName, 
        		resource_properties.toString(), 
        		provider_properties.toString());
        Assert.assertEquals(resourceID_type_list==null||resourceID_type_list.size()>0, true);

        // provider
//        boolean result = verifyPayloadFromKafkaConsumerOutput("provider", "providers.json", "nodejs_providers_payload_desc.json");
//        System.out.println("providers verification result is " + result);

        // NodeJsApplication of resources.json
//        boolean result = verifyPayloadFromKafkaConsumerOutput( "NodeJsApplication",  "resources.json", "nodejs_resources_nodeapplication_payload_desc.json");
//        System.out.println("resources of nodeapplication verification result is " + result);

        // AAR 
//        boolean result = verifyPayloadFromKafkaConsumerOutput("NodeJsApplication", "aar.middleware.json", "nodejs_aar_payload_desc.json");
//        System.out.println("providers verification result is " + result);
        
        // ADR
        boolean result = verifyPayloadFromKafkaConsumerOutput("ADRDummyType", "adr.middleware.json", "nodejs_adr_payload_desc.json");
        System.out.println("providers verification result is " + result);
        
		//boolean result = verifyPayloadFromKafkaConsumerOutput( "[\"nodeapplication\"]",  "aar.middleware.json", descPath+"nodejs_aar_payload_desc.json");
			
		//System.out.println("aar verification result is " + result);
		
		//boolean result = verifyPayloadFromKafkaConsumerOutput( "[\"npm\"]",  "resources.json", descPath+"nodejs_resources_npm_payload_desc.json");
		
		//System.out.println("resources of npm verification result is " + result);
		
		//boolean result = verifyPayloadFromKafkaConsumerOutput( "[\"compute\"]",  "resources.json", descPath+"nodejs_resources_compute_payload_desc.json");
		
		//System.out.println("resources of compute verification result is " + result);
		
		//boolean result = verifyPayloadFromKafkaConsumerOutput( "[\"nodeengine\"]",  "resources.json", descPath+"nodejs_resources_nodeengine_payload_desc.json");
		
		//System.out.println("resources of nodeengine verification result is " + result);

        
		//boolean result = verifyPayloadFromKafkaConsumerOutput( "[\"datacollector\"]",  "providers.json", descPath+"nodejs_providers_payload_desc.json");
		
		//System.out.println("providers verification result is " + result);
		
//		boolean result = verifyPayloadFromKafkaConsumerOutput( "application",  "metric.json", "nodejs_metric_appinfo_payload_desc.json");
//		
//		System.out.println("providers verification result is " + result);
        
//		boolean result = verifyPayloadFromKafkaConsumerOutput( "nodeengine",  "metric.json", "nodejs_metric_engineStats_payload_desc.json");
//		
//		System.out.println("providers verification result is " + result);
	}
}
