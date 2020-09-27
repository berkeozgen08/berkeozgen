let express = require("express");
let app = express();

require("dotenv").config();
let db = require("monk")(process.env.MONGO);
let snake = db.get("snake");

let port =  process.env.PORT || 3000;
let server = app.listen(port, () => {
	console.log("listening at " + port);
});

app.use(express.static("public"));
app.use(express.json({limit: "1kb"}));

app.post("/snake/api", (req, res, next) => {
	let data = req.body;

	let time = Date.now();
	data.time = time;
	
	snake.insert(data).catch(() => {
		res.sendStatus(500);
		next();
	});

	res.json(data);
});

app.get("/snake/api", (req, res, next) => {
	snake.find()
		.catch(() => {
			res.sendStatus(500);
			next();
		})
		.then((data) => {
			for(i of data) {
				delete i.time;
				delete i._id;
			}
			
			data.sort((a, b) => {
				return b.score - a.score;
			});

			let x = data.length;
			if(data.length > 9){
				x = 9;
			}

			temp = [];

			for(let i = 0; i < x; i++) {
				temp[i] = data[i];
			}

			res.json(temp);
		});
});

app.get("/snake/db", (req, res, next) => {
	snake.find()
		.catch(() => {
			res.sendStatus(500);
			next();
		})
		.then((data) => {
			data.sort((a, b) => {
				return b.time - a.time;
			});

			for(i of data) {
				delete i._id;
				i.time = new Date(i.time).toString();
			}
			
			res.json(data);
		})
});

let socket = require("socket.io");
let io = socket(server);

function messageChatling(data){
	console.log(data);
	io.sockets.emit("messageChatling", data);
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
							if (i[1].state.standing)
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
			standing: false,
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
			standing: false,
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
}

function lostConnection(socket) {
	console.log("lost connection:", socket.id);
	
	let arr = Array.from(players);
	if (arr.length > 0 && arr[turn][0] == socket.id) {
		if (arr.length > 1) arr.splice(turn, 1);
		if (arr.length <= turn) {
			turn = 0;
			dealer.play();
		}
	}

	players.delete(socket.id)
	io.sockets.emit("players", Array.from(players));
	
	if (arr.length > 0) 
		io.sockets.emit("turn", {name: arr[turn][1].name, index: arr[turn][1].index});
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
			players.get(socket.id).state.standing = true;
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

function stand(socket) {
	if (waiting) return;
	let arr = Array.from(players);
	if (arr.length > 0 && arr[turn][1] == players.get(socket.id)) {
		players.get(socket.id).state.standing = true;
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
	if (arr.length > 0)
		io.sockets.emit("turn", {name: arr[turn][1].name, index: arr[turn][1].index});
}

function message(data, socket){
	console.log(data);
	socket.broadcast.emit("message", data);
}

io.sockets.on("connection", (socket) => {
	console.log("new connection: " + socket.id);
	
	socket.on("name", (name) => newConnection(socket, name));
	
	socket.on("hit", () => hit(socket));
	
	socket.on("stand", () => stand(socket));
		
	socket.on("message", (data) => message(data, socket));


	socket.on("messageChatling", messageChatling); 
	io.sockets.emit("onlineChatling", Object.keys(io.sockets.sockets).length);
	
	socket.on("disconnect", () => {
		lostConnection(socket);
		io.sockets.emit("onlineChatling", Object.keys(io.sockets.sockets).length);
	});
});
