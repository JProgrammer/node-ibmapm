package automation.test.util;

import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.LineNumberReader;
import java.net.URL;

public class CmdHelper {
	public static String fetchKafkaConsumerOutputByTopic(String node, String user, String password,String topic) {
		//Get relative resource ID to filter result later (webserver)
        String script_full_path = getProjPath() + "scripts/rget_specific_topic.sh";
        String outputFileName = "/tmp/" + topic;
        String[] cmd = {"sudo", "-u", "root", 
        					script_full_path, 
        					node, 
        					user, 
        					password,
        					topic,
        					outputFileName,
        					"--from-beginning"};
        deleteFile(outputFileName);
        int ret = CmdHelper.executeCmd(cmd);
        if(ret == 0) {
        	File file = new File(outputFileName);
        	if(file.exists() && file.isFile()) {
        		return outputFileName;
        	}
        }
        
        return null;
	}
	
        public static int executeCmd(String cmd[]) {
                int ret = 0;

                try {
                        Process pcs = Runtime.getRuntime().exec(cmd);

                        InputStreamReader ir = new InputStreamReader(pcs.getInputStream());
                        LineNumberReader input = new LineNumberReader(ir);
                        String line = null;
                        while ((line = input.readLine()) != null){
                                System.out.println(line);
                        }

                        if(null != input){
                                input.close();
                        }

                        if(null != ir){
                                ir.close();
                        }

                        ret = pcs.waitFor();
                } catch (IOException e) {
                        e.printStackTrace();
                        return 1;
                } catch (InterruptedException e) {
                        e.printStackTrace();
                        return 1;
                }

                return ret;
        }
        
        public static String getDescFilePath() {
        	return getProjPath() + "payloads_desc/";
        }
        
        public static String getProjPath() {
            String className = CmdHelper.class.getName();
            String classNamePath = className.replace(".", "/") + ".class";
            URL is = CmdHelper.class.getClassLoader().getResource(classNamePath);
            String path = is.getFile();

            String proj_path;
            int index = path.indexOf("!");
            if (index > 0) {
                String jar_full_path = path.substring(0, path.indexOf("!"));
                proj_path = jar_full_path.substring(0, jar_full_path.lastIndexOf("/"));
            } else {
                proj_path = path.substring(0, path.lastIndexOf("/"));
            }

            if (proj_path.startsWith("file:")) {
                proj_path = proj_path.substring(5, proj_path.length());
            }
            
            if (proj_path.contains("bin")) {
                proj_path = proj_path.substring(0, proj_path.indexOf("bin"));
            }
            
            if (proj_path.contains("lib")) {
                proj_path = proj_path.substring(0, proj_path.indexOf("lib"));
            }

            System.out.println("Project path is " + proj_path);

            return proj_path;
        }
        
        public static void deleteFile(String filename) {
    		if(filename == null || filename.isEmpty())
    			return;
    		
        	String[] cmd = {"sudo", "-u", "root", 
    				"rm", 
    				"-f", 
    				filename};
    		CmdHelper.executeCmd(cmd);
        }
}                          