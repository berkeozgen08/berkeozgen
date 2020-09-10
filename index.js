let express = require("express");// npm install express
let app = express();
let Datastore = require("nedb");// npm install nedb

let database = new Datastore("database.db");// make a new database with the name "database.db"
database.loadDatabase();// load the database

let database1 = new Datastore("database1.db");
database1.loadDatabase();

let port =  process.env.PORT || 3000;
app.listen(port, function(){// initalize the server at localhost:3000
	console.log("listening at " + port);
});

app.use(express.static("public"));// for client site files
app.use(express.json({limit: "1mb"}));// for sending json with fetch()

// let ip;
app.post("/snake/api", (request, response) => {
	// ip = request.headers['x-forwarded-for'] ||
	// 		 request.connection.remoteAddress ||
	// 		 request.socket.remoteAddress ||
	// 		 (request.connection.socket ? request.connection.socket.remoteAddress : null);
	let data = request.body;
	// data.ip = ip;
	let time = Date(Date.now()).toString();// Date.now() gives miliseconds passed till 1970, Date gives the current date, toString well i think u know
	data.time = time;// add a time parameter to the date object
	database.insert(data);// add data to the database
	console.log(data);
	response.json(data);// response.send() would be more general && check index.html for fetching the response .then() (promises sth)
});

app.post("/snake/login", (request, response) => {
	// ip = request.headers['x-forwarded-for'] ||
	// 		 request.connection.remoteAddress ||
	// 		 request.socket.remoteAddress ||
	// 		 (request.connection.socket ? request.connection.socket.remoteAddress : null);
	let data = request.body;
	// data.ip = ip;
	let time = Date(Date.now()).toString();
	data.time = time;
	database1.insert(data);
	console.log(data);
	response.json(data);
});

app.get("/snake/api", (request, response) => {
	database.find({}, (err, data) => {
		if(err){
			response.end();
			console.log("Ran into an error");
			return;
		}

		for(i of data) {
			// delete i.ip;
			delete i.time;
		}

		data.sort(function(a, b){return b.score-a.score});

		let x = data.length;
		if(data.length > 9){
			x = 9;
		}

		temp = [];

		for(let i = 0; i < x; i++) {
			temp[i] = data[i];
		}

		response.json(temp);
	});
});

app.get("/snake/login", (request, response) => {
	// response.json(ip);
});
