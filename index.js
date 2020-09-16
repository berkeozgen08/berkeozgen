let express = require("express");// npm install express
let app = express();
let Datastore = require("nedb");// npm install nedb

let database = new Datastore("database.db");// make a new database with the name "database.db"
database.loadDatabase();// load the database

let database1 = new Datastore("database1.db");
database1.loadDatabase();

let port =  process.env.PORT || 3000;
let server = app.listen(port, function(){// initalize the server at localhost:3000
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


let socket = require("socket.io");

let io = socket(server); // input and output on server

function message(data){
	console.log(data);
	// socket.broadcast.emit("asd", data); // sends the data to all sockets except itself
	io.sockets.emit("messageChatling", data); // includes the client that sent the message 
}



let players = new Map();
let turn = 0;
let waiting = false;
let player_count = 0;
let deck = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

let dealer = {
	cards: [{value: deck[parseInt(Math.random() * 13)], suit: parseInt(Math.random() * 4)},
			{value: deck[parseInt(Math.random() * 13)], suit: parseInt(Math.random() * 4)}],
	shown: false,
	value: 0,
	hit() {
		this.cards.push({value: deck[parseInt(Math.random() * 13)], suit: parseInt(Math.random() * 4)});
	},
	getValue() {
		let sum = 0;
		let AIndex = [];
		for (let i = this.shown ? 0 : 1; i < this.cards.length; i++) {
			switch (this.cards[i].value) {
				case "J":
				case "Q":
				case "K":
					sum += 10;
					break;
				case "A":
					AIndex.push(i);
					break;
				default:
					sum += parseInt(this.cards[i].value);
			}
		}
		for (let i in AIndex) {
			if (sum + 11 > 21) sum += 1;
			else sum += 11;
		}
		this.value = sum;
		return sum;
	},
	play() {
		waiting = true;
		this.shown = true;
		this.getValue();
		io.sockets.emit("turn", {name: "Dealer", index: 0});
		setTimeout(() => {
			io.sockets.emit("dealer", this);
			io.sockets.emit("turn", {name: "Dealer", index: 0});
		}, 2000);
		setTimeout(() => {
			let interval = setInterval(() => {
				if (this.value < 17) {
					this.hit();
					this.getValue();
					io.sockets.emit("dealer", this);
					io.sockets.emit("turn", {name: "Dealer", index: 0});
				} else {
					clearInterval(interval);
					for (let i of Array.from(players)) {
						if (this.getValue() <= 21) {
							if (i[1].getValue() > this.value)
								i[1].state.won = true;
							else if (i[1].getValue() == this.value)
								i[1].state.tied = true;
							else
								i[1].state.lost = true;
						} else {
							if (i[1].state.staying)
								i[1].state.won = true;
						}
					}
					io.sockets.emit("players", Array.from(players));
					setTimeout(endGame, 5000);
				}
			}, 2000);
		}, 2000);
	},
	reset() {
		this.cards = [{value: deck[parseInt(Math.random() * 13)], suit: parseInt(Math.random() * 4)},
					  {value: deck[parseInt(Math.random() * 13)], suit: parseInt(Math.random() * 4)}];
		this.shown = false;
	}
};

class Player {
	
	constructor(socket, name) {
		this.index = player_count++;
		this.id = socket.id;
		this.name = name;
		this.cards = [{value: deck[parseInt(Math.random() * 13)], suit: parseInt(Math.random() * 4)},
					  {value: deck[parseInt(Math.random() * 13)], suit: parseInt(Math.random() * 4)}];
		this.state = {
			staying: false,
			bust: false,
			won: false,
			lost: false,
			tied: false
		}
		this.value;
		this.getValue();
	}
	
	hit() {
		this.cards.push({value: deck[parseInt(Math.random() * 13)], suit: parseInt(Math.random() * 4)});
	}
	
	getValue() {
		let sum = 0;
		let AIndex = [];
		for (let i = 0; i < this.cards.length; i++) {
			switch (this.cards[i].value) {
				case "J":
				case "Q":
				case "K":
					sum += 10;
					break;
				case "A":
					AIndex.push(i);
					break;
				default:
					sum += parseInt(this.cards[i].value);
			}
		}
		for (let i of AIndex) {
			if (sum + 11 > 21) sum += 1;
			else sum += 11;
		}
		this.value = sum;
		return sum;
	}
	
	reset() {
		this.cards = [{value: deck[parseInt(Math.random() * 13)], suit: parseInt(Math.random() * 4)},
					  {value: deck[parseInt(Math.random() * 13)], suit: parseInt(Math.random() * 4)}];
		this.state = {
			staying: false,
			bust: false,
			won: false,
			lost: false,
			tied: false
		}
		this.value;
		this.getValue();
	}
	
}


function newConnection(socket, name) {
	player = new Player(socket, name);
	players.set(socket.id, player);
	let arr = Array.from(players);
	io.sockets.emit("players", arr);
	socket.emit("self", player);
	dealer.getValue();
	socket.emit("dealer", dealer);
	io.sockets.emit("turn", {name: arr[turn][1].name, index: arr[turn][1].index});
	io.sockets.emit("online", arr);
}

function lostConnection(socket) {
	console.log("lost connection:", socket.id);
	
	let arr = Array.from(players);
	if (arr.length > 0 && arr[turn][0] == socket.id) {
		if (arr.length > 1) arr.splice(turn, 1);
		if (arr.length <= turn) turn = 0;
	}
	if (arr.length > 0) 
		io.sockets.emit("turn", {name: arr[turn][1].name, index: arr[turn][1].index});

	players.delete(socket.id)
	io.sockets.emit("players", Array.from(players));
}

function hit(socket) {
	if (waiting) return;
	let arr = Array.from(players);
	if (arr.length > 0 && arr[turn][1] == players.get(socket.id)) {
		players.get(socket.id).hit();
		if (players.get(socket.id).getValue() > 21) {
			players.get(socket.id).state.bust = true;
			io.sockets.emit("players", Array.from(players));
			if (++turn >= arr.length) {
				turn = 0;
				dealer.play();
				return;
			}
		}
		else if (players.get(socket.id).getValue() == 21) {
			players.get(socket.id).state.won = true;
			io.sockets.emit("players", Array.from(players));
			if (++turn >= arr.length) {
				turn = 0;
				dealer.play();
				return;
			}
		}
		io.sockets.emit("players", Array.from(players));
		io.sockets.emit("turn", {name: arr[turn][1].name, index: arr[turn][1].index});
	}
}

function stay(socket) {
	if (waiting) return;
	let arr = Array.from(players);
	if (arr.length > 0 && arr[turn][1] == players.get(socket.id)) {
		players.get(socket.id).state.staying = true;
		io.sockets.emit("players", Array.from(players));
		if (++turn >= arr.length) {
			turn = 0;
			dealer.play();
			return;
		}
		io.sockets.emit("turn", {name: arr[turn][1].name, index: arr[turn][1].index});
	}
}

function endGame() {
	waiting = false;
	dealer.reset();
	let arr = Array.from(players);
	arr.forEach(p => p[1].reset());
	dealer.getValue();
	io.sockets.emit("dealer", dealer);
	io.sockets.emit("players", Array.from(players));
	io.sockets.emit("turn", {name: arr[turn][1].name, index: arr[turn][1].index});
}

io.sockets.on("connection", (socket) => {
	console.log("new connection: " + socket.id);
	
	socket.on("name", (name) => newConnection(socket, name));
	
	socket.on("hit", () => hit(socket));
	
	socket.on("stay", () => stay(socket));
	
	
	//chatling
	socket.on("messageChatling", message); 
	io.sockets.emit("onlineChatling", Object.keys(io.sockets.sockets).length);
	
	socket.on("disconnect", () => {
		lostConnection(socket);
		io.sockets.emit("onlineChatling", Object.keys(io.sockets.sockets).length);
		io.sockets.emit("online", Array.from(players));
	});
});
