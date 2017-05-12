package automation.test.util;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class OutputParser {
	
	public static String fetchSpecificOriginIDFromResourcePayload(String resourcePayloadFileName, String providerPayloadFileName, String resource_payload_properties, String provider_payload_properties) {
		JSONObject provider_properties = JSONTool.parseJSONObjectFromStr(provider_payload_properties);
		if(provider_properties == null) {
			return null;
		}
		
		JSONObject resource_properties = JSONTool.parseJSONObjectFromStr(resource_payload_properties);
		if(resource_properties == null) {
			return null;
		}
		
		Map<String,String> originIDs = fetchSpecificOriginIDByDCName(providerPayloadFileName, provider_properties);
		String theOriginID = null;
		
		
		JSONArray payloads = parseOutputFromKafkaConsumer(resourcePayloadFileName);
		for(int i = 0 ; i < payloads.size() ; i ++) {
			Object obj = payloads.get(i);
			if(obj instanceof JSONObject) {
				JSONObject payload = (JSONObject)obj;
				if(obj != null) {
					boolean matched = true;
					Set<Map.Entry<String, Object>> set = (Set<Map.Entry<String, Object>>) (resource_properties
							.entrySet());
					for (Map.Entry<String, Object> entry : set) {
						String key = entry.getKey();
						Object value = entry.getValue();
						Object targetValue = payload.get(key);
						if (targetValue == null
								|| !targetValue.toString().contains(
										value.toString())) {
							matched = false;
							break;
						}
					}
                    if (matched) {
                        JSONArray refArray = (JSONArray) payload.get("_references");
                        for (int j = 0; j < refArray.size(); j++) {
                            Object ref = refArray.get(j);
                            if (ref instanceof JSONObject) {
                                Object refValue = ((JSONObject) ref).get("_fromUniqueId");
                                if (refValue != null) {
                                    String originID = refValue.toString();
                                    if (originIDs.containsKey(originID)) {
                                        theOriginID = originID;
                                    }
                                }
                            }
                        }
					}
				}
			}
		}

		return theOriginID;
	}
	
	public static Map<String,JSONArray> fetchSpecificResourceIDsFromResourcePayload(String resourcePayloadFileName, String providerPayloadFileName, String resource_payload_properties, String provider_payload_properties) {
		JSONObject provider_properties = JSONTool.parseJSONObjectFromStr(provider_payload_properties);
		if(provider_properties == null) {
			return null;
		}
		
		JSONObject resource_properties = JSONTool.parseJSONObjectFromStr(resource_payload_properties);
		if(resource_properties == null) {
			return null;
		}
		
		Map<String,JSONArray> result = new HashMap<String,JSONArray>();
			
		JSONArray payloads = parseOutputFromKafkaConsumer(resourcePayloadFileName);
		for(int i = 0 ; i < payloads.size() ; i++) {
			Object obj = payloads.get(i);
			if(obj instanceof JSONObject) {
				JSONObject payload = (JSONObject)obj;
				obj = payload.get("uniqueId");
				if(obj != null) {
					String resourceID = obj.toString();
						obj = payload.get("entityTypes");
						if(obj != null && obj instanceof JSONArray) {
									result.put(resourceID,(JSONArray)obj);
							}		
				}
			}
		}
		
		return result;
	}
	
	public static JSONArray getAARPayloadsByResourceID(String payloadFileName, String resourceID) {
		JSONArray payloads = parseOutputFromKafkaConsumer(payloadFileName);
		if(payloads == null) {
			return null;
		}
		
		JSONArray result = new JSONArray();
		for(int i = 0 ; i < payloads.size() ; i ++) {
			JSONObject payload = (JSONObject)payloads.get(i);
			Object obj = payload.get("properties");
			if(obj == null || !(obj instanceof JSONObject)) {
				continue;
			}
			
			JSONObject properties = (JSONObject)obj;
			obj = properties.get("resourceID");
			if(obj == null) {
				continue;
			}
			
			if(resourceID.equals(obj.toString())) {
				result.add(payload);
			}
		}
		
		return result;
	}
	
	public static JSONArray getMetricPayloadsByResourceID(String payloadFileName, String resourceID) {
		JSONArray payloads = parseOutputFromKafkaConsumer(payloadFileName);
		if(payloads == null) {
			return null;
		}
		
		JSONArray result = new JSONArray();
		for(int i = 0 ; i < payloads.size() ; i ++) {
			JSONObject payload = (JSONObject)payloads.get(i);
			Object obj = payload.get("resourceID");
			if(obj == null) {
				continue;
			}
			
			if(resourceID.equals(obj.toString())) {
				result.add(payload);
			}
		}
		
		return result;
	}
	
	public static JSONArray getADRPayloadsByOriginID(String payloadFileName, String originID) {
		JSONArray payloads = parseOutputFromKafkaConsumer(payloadFileName);
		if(payloads == null) {
			return null;
		}
		
		JSONArray result = new JSONArray();
		for(int i = 0 ; i < payloads.size() ; i ++) {
			JSONObject payload = (JSONObject)payloads.get(i);
			Object obj = payload.get("properties");
			if(obj == null || !(obj instanceof JSONObject)) {
				continue;
			}
			
			JSONObject properties = (JSONObject)obj;
			obj = properties.get("originID");
			if(obj == null) {
				continue;
			}
			
			if(originID.equals(obj.toString())) {
				result.add(payload);
			}
		}
		
		return result;
	}
	
	public static JSONArray getProvidersPayloadsByOriginID(String payloadFileName, String originID) {
		JSONArray payloads = parseOutputFromKafkaConsumer(payloadFileName);
		if(payloads == null) {
			return null;
		}
		
		JSONArray result = new JSONArray();
		for(int i = 0 ; i < payloads.size() ; i ++) {
			JSONObject payload = (JSONObject)payloads.get(i);
			Object obj = payload.get("resourceID");
			if(obj == null || !(obj instanceof String)) {
				continue;
			}
			
			if(originID.equals(obj.toString())) {
				result.add(payload);
			}
		}
		
		return result;
	}
	
	public static JSONArray getResourcesPayloadsByOriginIDAndType(String payloadFileName, String id, JSONArray type) {
		JSONArray payloads = parseOutputFromKafkaConsumer(payloadFileName);
		if(payloads == null) {
			return null;
		}
		
		JSONArray result = new JSONArray();
		for(int i = 0 ; i < payloads.size() ; i ++) {
			JSONObject payload = (JSONObject)payloads.get(i);
			Object obj = payload.get("uniqueId");
			if(obj != null) {
				String uniqueId = obj.toString();
				if(uniqueId.equals(id)) {
					JSONArray typeJSON = (JSONArray)payload.get("entityTypes");
					Map<String,String> typeMap = new HashMap<String,String>();
					
					for(int j = 0 ; j < typeJSON.size() ; j ++) {
						typeMap.put(typeJSON.get(j).toString(), "");
					}
					
					boolean matched=true;
					for(int j = 0 ; j < type.size() ; j ++) {
						if(!typeMap.containsKey(type.get(j))) {
							matched=false;
							break;
						}
					}
					
					if(matched)
						result.add(payload);
				}
			}
		}
		
		return result;
	}
	
    public static JSONArray parseOutputFromKafkaConsumer(String filename) {
        JSONArray result = new JSONArray();

        try {
            BufferedReader br = new BufferedReader(new InputStreamReader(new FileInputStream(filename)));
            String str = br.readLine();
            if (str.startsWith("[")) {
                StringBuffer buf = new StringBuffer();
                do {
                    buf.append(str);
                } while ((str = br.readLine()) != null);
                
                result = JSONArray.parse(buf.toString());
            } else {
                do {
                    JSONObject json = parseJSONObject(str);
                    if (json != null) {
                        result.add(json);
                    }

                } while ((str = br.readLine()) != null);
            }

        } catch (FileNotFoundException e) {
            e.printStackTrace();

        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();

        }
        return result;
    }
    
	private static Map<String,String> fetchSpecificOriginIDByDCName(String providerPayloadFileName, JSONObject provider_properties) {
		Map<String,String> originIDs = new HashMap<String,String>();
		
		JSONArray payloads = parseOutputFromKafkaConsumer(providerPayloadFileName);
		for(int i = 0 ; i < payloads.size() ; i++) {
			Object obj = payloads.get(i);
			if(obj instanceof JSONObject) {
				JSONObject payload = (JSONObject)obj;
				obj = payload.get("resourceID");
				if(obj != null) {
					String originID = obj.toString();
					
					boolean matched = true;
					Set<Map.Entry<String, Object>> set = (Set<Map.Entry<String, Object>>) (provider_properties
							.entrySet());

					for (Map.Entry<String, Object> entry : set) {
						String key = entry.getKey();
						Object value = entry.getValue();
						Object targetValue = payload.get(key);
						if (targetValue != null) {
							if (!targetValue.toString()
									.contains(value.toString())) {
								matched = false;
								break;
							}
						} else {
							matched = false;
							break;
						}
					}
					originIDs.put(originID, "");
				}
			}
		}
		
		return originIDs;
	}
	
    private static JSONObject parseJSONObject(String str) {
    	try {
			JSONObject json = JSONObject.parse(str);
			return json;
		} catch (IOException e) {
			// TODO Auto-generated catch block
			return null;
		}
    }
    
    public static void main(String args[]) {
    	Map<String,JSONArray> result = fetchSpecificResourceIDsFromResourcePayload("/Users/songhuijun/Downloads/payloads/resources.json", 
    											"/Users/songhuijun/Downloads/payloads/providers.json", 
    											"{\"name\":\"linux OS: tivfpvm130/127.0.0.1\",\"hostname\":\"tivfpvm130\",\"ip\":\"127.0.0.1\"}", 
    											"{\"name\":\"RubyResourceMonitorDC\"}");
    		
    	for(Map.Entry<String,JSONArray> entry: result.entrySet()) {
    		System.out.println(String.format("resourceID: %s --- type: %s", entry.getKey(), entry.getValue()));
    	}
    }
}
