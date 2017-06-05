package automation.test.util;

import java.util.Map;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

/* for version 1.0 */
public class PayloadVerifier {
	public static boolean verifyPayload(JSONObject payload, String verificationDescFileName) {
		boolean result = false;
		
		JSONObject descJSON = JSONTool.parseJSONObject(verificationDescFileName);
		if(descJSON == null) {
			System.out.println("Cannot parse verification desc file from " + verificationDescFileName);
			return false;
		}
		
		Object obj = descJSON.get("DocVersion");
		if(obj == null || obj.toString().equals("1.0") == false) {
			System.out.println("verification desc file " + verificationDescFileName + " includes invalid version");
			return false;
		}
		
		obj = descJSON.get("DocDesc");
		if(obj == null || obj instanceof JSONArray == false) {
			System.out.println("invalid verification desc file " + verificationDescFileName + "!");
			return false;
		}
		
		JSONArray DocDesc = (JSONArray)obj;
		
		result = doVerification(DocDesc, payload);
		
		return result;
	}
	
	private static boolean doVerification(JSONArray DocDesc, JSONObject payload) {
		for(int i = 0 ; i < DocDesc.size() ; i ++) {
			JSONObject descItem = (JSONObject)DocDesc.get(i);
			String fieldName = (String)descItem.get("FieldName");
			String fieldType = (String)descItem.get("FieldType");
			System.out.println("Verify " + fieldName);
			Object target = payload.get(fieldName);
			if(target == null) {
				System.out.println(String.format("Verification failed: %s is not found in payload!", fieldName));
				return false;
			}
			
			if(fieldType.equals("JSONOBJECT")) {
				boolean result = verifyJSONOBJECT(descItem, target);
				if(result == false)
					return result;
			}
			else if(fieldType.equals("JSONARRAY")) {
				boolean result = verifyJSONARRAY(descItem, target);
				if(result == false)
					return result;
			}
			else {
				boolean result = verifyBasicType(descItem, target);
				if(result == false)
					return result;
			}
		}
		return true;
	}
	
	/*
	 * 
	 {
      "FieldName" : "metrics",
      "FieldType" : "JSONOBJ",
      "Content" : [
        {
          "Range" : {
            "MinLength" : 1
          },
          "FieldName" : "status",
          "FieldType" : "STRING"
        },
        {
          "FieldName" : "responseTime",
          "FieldType" : "FLOAT",
          "Range" : {
            "MinValue" : 0,
            "MaxValue" : 100000
          }
        }
      ]
    }
	 */
	private static boolean verifyJSONOBJECT(JSONObject fieldDef, Object target) {
		Object fieldName = fieldDef.get("FieldName");
		Object obj = fieldDef.get("Content");
		
		System.out.println("Start verify JSONObject field " + fieldName);
		
		if(obj == null || !(obj instanceof JSONArray)) {
			System.out.println(String.format("Verification failed: Content of %s should be defined and must be JSONArray", fieldName));
			return false;
		}
		
		if(target == null || !(target instanceof JSONObject)) {
			System.out.println(String.format("Verification failed: target of %s is not JSONObject", fieldName));
			return false;
		}
		
		JSONArray content = (JSONArray)obj;
		JSONObject targetJSON = (JSONObject)target;
		
		for(int i = 0 ; i < content.size() ; i ++ ) {
			JSONObject item = (JSONObject)content.get(i);
			obj = item.get("FieldType");
			String fieldType = obj.toString();
			obj = item.get("FieldName");
			fieldName = obj.toString();
			Object targetObj = targetJSON.get(fieldName);
			if (targetObj != null) {
                if (fieldType.equals("JSONOBJECT")) {
                    boolean result = verifyJSONOBJECT(item, targetObj);
                    if (result == false)
                        return result;
                } else if (fieldType.equals("JSONARRAY")) {
                    boolean result = verifyJSONARRAY(item, targetObj);
                    if (result == false)
                        return result;
                } else {
                    boolean result = verifyBasicType(item, targetObj);
                    if (result == false)
                        return result;
                }
            }
					
		}
		
		return true;
	}
	
	/*
	 *   	{
      "FieldName" : "type",
      "FieldType" : "JSONARRAY",
      "Content" :[
      	{
          "FieldType" : "STRING",
          "MinCount":1,
		  "MaxCount":1,
          "Values" : [
            "nodeengine"
          ]
      	}
      ]
    }
	 */
	private static boolean verifyJSONARRAY(JSONObject fieldDef, Object target) {//TODO
		Object fieldName = fieldDef.get("FieldName");
		Object obj = fieldDef.get("Content");
		
		System.out.println("Start verify JSONArray field " + fieldName);
		
		if(obj == null || !(obj instanceof JSONObject)) {
			System.out.println(String.format("Verification failed: Content of %s should be defined and must be JSONObject", fieldName));
			return false;
		}
		
		if(target == null || !(target instanceof JSONArray)) {
			System.out.println(String.format("Verification failed: target of %s is not JSONArray", fieldName));
			return false;
		}
		
		JSONObject content = (JSONObject)obj;
		JSONArray targetJSON = (JSONArray)target;
		
		JSONObject item = (JSONObject)content;
		obj = item.get("FieldType");
		String fieldType = obj.toString();
		obj = item.get("FieldName");
		if(obj != null)
			fieldName = obj.toString();
		else
			fieldName = "DummyName";
		item.put("FieldName", fieldName);
		
		long minCount=-1;
		obj = item.get("MinCount");
		if(obj != null)
			minCount = (Long)obj;
		
		long maxCount = -1;
		obj = item.get("MaxCount");
		if(obj != null)
			maxCount = (Long)obj;
		
		if(minCount > -1) {
			if(targetJSON.size() < minCount) {
				System.out.println(String.format("Count of item in JSONArray(%d) is less than %d", 
						targetJSON.size(), minCount));
				return false;
			}
		}
		
		if(maxCount > -1) {
			if(targetJSON.size() > maxCount) {
				System.out.println(String.format("Count of item in JSONArray(%d) is larger than %d", 
						targetJSON.size(), maxCount));
				return false;
			}
		}
		
		for(int i = 0 ; i < targetJSON.size() ; i++) {
			if(fieldType.equals("JSONOBJECT")) {
				JSONObject itemJSON = (JSONObject)targetJSON.get(i);
				obj = itemJSON.get("FieldName");
				if(obj == null)
					itemJSON.put("FieldName", fieldName);
				boolean result = verifyJSONOBJECT(item, itemJSON);
				if(result == false)
					return result;
			}
			else if(fieldType.equals("JSONARRAY")) {
				JSONArray itemJSON = (JSONArray)targetJSON.get(i);
				boolean result = verifyJSONARRAY(item, itemJSON);
				if(result == false)
					return result;
			}
			else {
				boolean result = verifyBasicType(item, targetJSON.get(i));
				if(result == false)
					return result;
			}
		}
		
		return true;
	}
	
	private static boolean verifyBasicType(JSONObject fieldDef, Object target) {
		String fieldName = (String)fieldDef.get("FieldName");
		String fieldType = (String)fieldDef.get("FieldType");
		
		System.out.println("Start verify basic field " + fieldName);
		
		if(target == null) {
			System.out.println(String.format("Verification failed: %s is not defined in payload", fieldName));
			return false;		
		}
		
		if(fieldType.equals("STRING")) {
			if(target instanceof String) {
				return verifyString(fieldDef, target);
			}
			System.out.println(String.format("Verification failed: type of %s is not \"STRING\"!", fieldName));
			return false;
		}
		else if(fieldType.equals("NUMBER")) {
			if(target instanceof Integer || target instanceof Long) {
				return verifyNumber(fieldDef, target);
			}
			System.out.println(String.format("Verification failed: type of %s is not \"NUMBER\"!", fieldName));
			return false;
		}
		else if(fieldType.equals("FLOAT")) {
			if(target instanceof Float || target instanceof Double) {
				return verifyFloat(fieldDef, target);
			}
			System.out.println(String.format("Verification failed: type of %s is not \"FLOAT\"!", fieldName));
			return false;
		}
        else if (fieldType.equals("FLOATNUMBER")) {// The type can be float or number
            if (target instanceof Integer || target instanceof Long) {
                return verifyNumber(fieldDef, target);
            } else if (target instanceof Float || target instanceof Double) {
                return verifyFloat(fieldDef, target);
            }

            System.out.println(String.format("Verification failed: type of %s is not \"FLOAT or NUMBER\"!", fieldName));
            return false;
        }
		else if(fieldType.equals("BOOLEAN")) {
			if(target instanceof Boolean) {
				return true;
			}
			System.out.println(String.format("Verification failed: type of %s is not \"BOOLEAN\"!", fieldName));
			return false;
		}
		else if(fieldType.equals("ISOTIME")) {
			return true; //TODO 
		}
		else {
			System.out.println(String.format("Verification failed: type %s is invalid!", fieldType));
			return false;
		}
	}
	
	private static boolean verifyString(JSONObject fieldDef, Object target) {
		Object obj = fieldDef.get("Range");
		if(obj != null) {
			JSONObject range = (JSONObject)obj;
			obj = range.get("Length");
			if(obj != null) {
				long length = Long.parseLong(obj.toString());
				String it = (String)target;
				if(it.length() < length) {
					System.out.println(String.format("Verification failed: length of %s is not %s",
							target.toString(), obj.toString()));
					return false;
				}
			}
			else {
				obj = range.get("MinLength");
				if(obj != null) {
					long min = Long.parseLong(obj.toString());
					String it  = (String)target;
					if(it.length() < min) {
						System.out.println(String.format("Verification failed: length of %s is less than min value %s",
								target.toString(), obj.toString()));
						return false;
					}
				}
				
				obj = range.get("MaxLength");
				if(obj != null) {
					long max = Long.parseLong(obj.toString());
					String it  = (String)target;
					if(it.length() > max) {
						System.out.println(String.format("Verification failed: length of %s is larger than max value %s",
								target.toString(), obj.toString()));
						return false;
					}
				}
			}
		}
		else {
			obj = fieldDef.get("Values");
			if(obj != null) {
				boolean foundIt=false;
				JSONArray values = (JSONArray)obj;
				for(int i = 0 ; i < values.size() ; i ++) {
					String value = values.get(i).toString();
					String it = (String)target;
					if(it.equals(value)) {
						foundIt = true;
						break;
					}
				}
				if(! foundIt) {
					System.out.println(String.format("Verification failed: value %s is not in allowed value list",
							target.toString()));
					System.out.println("Allowed values are " + values.toString());
					return false;
				}
			}
		}
		
		return true;
	}
	
	private static boolean verifyFloat(JSONObject fieldDef, Object target) {
		Object obj = fieldDef.get("Range");
		if(obj != null) {
			JSONObject range = (JSONObject)obj;
			obj = range.get("MinValue");
			if(obj != null) {
				double min = Double.parseDouble(obj.toString());
				double it  = Double.parseDouble(target.toString());
				if(it < min) {
					System.out.println(String.format("Verification failed: value %s is less than min value %s",
							target.toString(), obj.toString()));
					return false;
				}
			}
			
			obj = range.get("MaxValue");
			if(obj != null) {
				double max = Double.parseDouble(obj.toString());
				double it  = Double.parseDouble(target.toString());
				if(it > max) {
					System.out.println(String.format("Verification failed: value %s is larger than max value %s",
							target.toString(), obj.toString()));
					return false;
				}
			}
		}
		else {
			obj = fieldDef.get("Values");
			if(obj != null) {
				boolean foundIt=false;
				JSONArray values = (JSONArray)obj;
				for(int i = 0 ; i < values.size() ; i ++) {
					double value = Double.parseDouble(values.get(i).toString());
					double it = Double.parseDouble(target.toString());
					if(it == value) {
						foundIt = true;
						break;
					}
				}
				if(! foundIt) {
					System.out.println(String.format("Verification failed: value %s is not in allowed value list",
							target.toString()));
					System.out.println("Allowed values are " + values.toString());
					return false;
				}
			}
		}
		
		return true;
	}
	
	private static boolean verifyNumber(JSONObject fieldDef, Object target) {
		Object obj = fieldDef.get("Range");
		if(obj != null) {
			JSONObject range = (JSONObject)obj;
			obj = range.get("minValue");
			if(obj != null) {
				long min = Long.parseLong(obj.toString());
				long it  = Long.parseLong(target.toString());
				if(it < min) {
					System.out.println(String.format("Verification failed: value %s is less than min value %s",
							target.toString(), obj.toString()));
					return false;
				}
			}
			
			obj = range.get("maxValue");
			if(obj != null) {
				long max = Long.parseLong(obj.toString());
				long it  = Long.parseLong(target.toString());
				if(it > max) {
					System.out.println(String.format("Verification failed: value %s is larger than max value %s",
							target.toString(), obj.toString()));
					return false;
				}
			}
		}
		else {
			obj = fieldDef.get("Values");
			if(obj != null) {
				boolean foundIt=false;
				JSONArray values = (JSONArray)obj;
				for(int i = 0 ; i < values.size() ; i ++) {
					long value = Long.parseLong(values.get(i).toString());
					long it = Long.parseLong(target.toString());
					if(it == value) {
						foundIt = true;
						break;
					}
				}
				if(!foundIt) {
					System.out.println(String.format("Verification failed: value %s is not in allowed value list",
							target.toString()));
					System.out.println("Allowed values are " + values.toString());
					return false;
				}
			}
		}
		
		return true;
	}
	
	public static void main(String args[]) {
		String descPath = "/Users/songhuijun/Documents/work/NodeJS/rtc_nodejs_cloudnative_project/knj/automation_test/scripts/payloads_desc";
		Map<String,JSONArray> result = OutputParser.fetchSpecificResourceIDsFromResourcePayload("/Users/songhuijun/Downloads/nodejs_bam_payloads/resources.json", 
				"/Users/songhuijun/Downloads/payloads/providers.json", 
				"{\"name\":\"nc9098038144\"}", 
				"{\"name\":\"NodeJSjoyce3DC\"}");
		
		String specificResourceID = "";
		for(Map.Entry<String,JSONArray> entry: result.entrySet()) {
			String resourceID = entry.getKey();
			JSONArray type = entry.getValue();
			for(int i = 0 ; i < type.size() ; i ++) {
				if(type.get(i).toString().equals("rails")) {
					specificResourceID = resourceID;
					break;
				}
			}
			if(specificResourceID.isEmpty() == false)
				break;
		}
		
		System.out.println(String.format("Got resourceID %s for %s", specificResourceID, "rails"));
		
		JSONArray payloads = OutputParser.parseOutputFromKafkaConsumer("/Users/songhuijun/Downloads/payloads/aar.middleware.json");
		JSONObject payload=null;
		for(int i = 0 ; i < payloads.size() ; i ++) {
			JSONObject it = (JSONObject)payloads.get(i);
			JSONObject properties = (JSONObject)it.get("properties");
			String resourceID = properties.get("resourceID").toString();
			if(resourceID.equals(specificResourceID)) {
				payload = it;
				break;
			}
		}
		
		System.out.println("payload is " + payload);
		
		boolean result1 = verifyPayload( payload, "/Users/songhuijun/Downloads/payloads/aar_payload_verification_desc.json");
		
		System.out.println("verification result is " + result1);
	}
}
