
(function(req) {


	var mongoose = req('mongoose');
	var config = req('./config');
	
	var dbconfig = config.database;

	var username = dbconfig.user;
	var password = dbconfig.pass;
	var url = dbconfig.url;
	var port = dbconfig.port;
	var db = dbconfig.db;

	var uri = "mongodb://" + username + ":" + password + "@" + url + ":" + port + "/" + db;

	mongoose.connect(uri);

	var connection = mongoose.createConnection(uri);

	connection.on("open", function(){

		console.log("Connection opened to mongodb at %s", uri);
	});

	connection.on("error", console.error.bind(console, "connection error:"));

})(require);
