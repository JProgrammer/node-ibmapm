package automation.test.util;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStreamReader;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class JSONTool { 
    public static JSONObject parseJSONObjectFromStr(String content) {
        JSONObject result = new JSONObject();
        
        try {
			JSONObject json = JSONObject.parse(content);
			return json;
        } catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
       
        return result;
    }
    
    public static JSONObject parseJSONObject(String filename) {
        JSONObject result = new JSONObject();
        
        try {
			BufferedReader br = new BufferedReader(new InputStreamReader(new FileInputStream(filename)));

			JSONObject json = JSONObject.parse(br);
			return json;
        } catch (FileNotFoundException e) {
			// TODO Auto-generated catch block
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
       
        return result;
    }
    
    public static JSONArray parseJSONArray(String content) {
        JSONArray result = null;
        
        try {
			result = JSONArray.parse(content);
        } catch (FileNotFoundException e) {
			// TODO Auto-generated catch block
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
       
        return result;
    }
}
