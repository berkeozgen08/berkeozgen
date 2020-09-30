module.exports = io => {
	const blackjack = io.of("/blackjack");
	
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
			blackjack.emit("turn", {name: "Dealer", index: 0});
			setTimeout(() => {
				blackjack.emit("dealer", this);
				blackjack.emit("turn", {name: "Dealer", index: 0});
			}, 2000);
			setTimeout(() => {
				let interval = setInterval(() => {
					if (this.value < 17) {
						this.hit();
						this.getValue();
						blackjack.emit("dealer", this);
						blackjack.emit("turn", {name: "Dealer", index: 0});
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
						blackjack.emit("players", Array.from(players));
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
		blackjack.emit("players", arr);
		socket.emit("self", player);
		dealer.getValue();
		socket.emit("dealer", dealer);
		blackjack.emit("turn", {name: arr[turn][1].name, index: arr[turn][1].index});
	}

	function lostConnection(socket) {
		let arr = Array.from(players);
		if (arr.length > 0 && arr[turn][0] == socket.id) {
			if (arr.length > 1) arr.splice(turn, 1);
			if (arr.length <= turn) {
				turn = 0;
				dealer.play();
			}
		}

		players.delete(socket.id)
		blackjack.emit("players", Array.from(players));
		
		if (arr.length > 0) 
			blackjack.emit("turn", {name: arr[turn][1].name, index: arr[turn][1].index});
	}

	function hit(socket) {
		if (waiting) return;
		let arr = Array.from(players);
		if (arr.length > 0 && arr[turn][1] == players.get(socket.id)) {
			players.get(socket.id).hit();
			if (players.get(socket.id).getValue() > 21) {
				players.get(socket.id).state.bust = true;
				blackjack.emit("players", Array.from(players));
				if (++turn >= arr.length) {
					turn = 0;
					dealer.play();
					return;
				}
			}
			else if (players.get(socket.id).getValue() == 21) {
				players.get(socket.id).state.standing = true;
				blackjack.emit("players", Array.from(players));
				if (++turn >= arr.length) {
					turn = 0;
					dealer.play();
					return;
				}
			}
			blackjack.emit("players", Array.from(players));
			blackjack.emit("turn", {name: arr[turn][1].name, index: arr[turn][1].index});
		}
	}

	function stand(socket) {
		if (waiting) return;
		let arr = Array.from(players);
		if (arr.length > 0 && arr[turn][1] == players.get(socket.id)) {
			players.get(socket.id).state.standing = true;
			blackjack.emit("players", Array.from(players));
			if (++turn >= arr.length) {
				turn = 0;
				dealer.play();
				return;
			}
			blackjack.emit("turn", {name: arr[turn][1].name, index: arr[turn][1].index});
		}
	}

	function endGame() {
		waiting = false;
		dealer.reset();
		let arr = Array.from(players);
		arr.forEach(p => p[1].reset());
		dealer.getValue();
		blackjack.emit("dealer", dealer);
		blackjack.emit("players", Array.from(players));
		if (arr.length > 0)
			blackjack.emit("turn", {name: arr[turn][1].name, index: arr[turn][1].index});
	}

	function message(data, socket){
		socket.broadcast.emit("message", data);
	}

	blackjack.on("connection", (socket) => {
		socket.on("name", (name) => newConnection(socket, name));
		socket.on("hit", () => hit(socket));
		socket.on("stand", () => stand(socket));
		socket.on("message", (data) => message(data, socket));
		socket.on("disconnect", () => {
			lostConnection(socket);
		});
	})
};