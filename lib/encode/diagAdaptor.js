var fs = require('fs');
var encoder = require('./encoder');
function readFile(fileName){

	var content = fs.readFileSync(fileName, 'utf8');
	
	return content;
}

function addEncoder(fileContent, option){
	var contenWraper = encoder.wraper(fileContent, option);
	return contenWraper;
}



exports.addEncoder = addEncoder;
