const socket = io.connect("/");

socket.emit("name", prompt("Enter your name") || "no name");

socket.on("self", (player) => {
	document.getElementById("name").innerText = player.name;
});

socket.on("online", (players) => {
	let str = "";
	for (let i of players) {
		str += i[1].name + ", ";
	}
	if (players.length == 0) str = "0";
	document.getElementById("online").innerText = str.substring(0, str.length > 2 ? str.length - 2 : str.length);
});

socket.on("dealer", (dealer) => {
	let node = document.getElementById("dealer");
	while (node.firstChild)
		node.removeChild(node.lastChild);
	
	let foo = document.createElement("h3");
	foo.innerText = "Dealer";
	foo.setAttribute("class", "name");
	document.getElementById("dealer").appendChild(foo);

	for (let i = 0; i < dealer.cards.length; i++) {
		if (i == 0 && !dealer.shown)
			document.getElementById("dealer").appendChild(getImage(0));
		else
			document.getElementById("dealer").appendChild(getImage(dealer.cards[i]));
	}

	let bar = document.createElement("p");
	bar.innerText = "Dealer has " + dealer.value;
	document.getElementById("dealer").appendChild(bar);

});

socket.on("players", (players) => {
	let node = document.getElementById("players");
	while (node.firstChild)
		node.removeChild(node.lastChild);

	for (let i = 0; i < players.length; i++) {
		let foo = document.createElement("div");
		foo.setAttribute("id", "player" + players[i][1].index);

		let name = document.createElement("h3");
		name.innerText = players[i][1].name;
		name.setAttribute("class", "name");
		foo.appendChild(name);

		for (let j = 0; j < players[i][1].cards.length; j++) {
			foo.appendChild(getImage(players[i][1].cards[j]));
		}
		if (players[i][1].state.bust) {
			let bar = document.createElement("p");
			bar.innerText = "Bust with " + players[i][1].value;
			foo.appendChild(bar);
		}
		else if (players[i][1].state.won) {
			let bar = document.createElement("p");
			bar.innerText = "Won with " + players[i][1].value;
			foo.appendChild(bar);
		}
		else if (players[i][1].state.lost) {
			let bar = document.createElement("p");
			bar.innerText = "Lost with " + players[i][1].value;
			foo.appendChild(bar);
		}
		else if (players[i][1].state.tied) {
			let bar = document.createElement("p");
			bar.innerText = "Tied with " + players[i][1].value;
			foo.appendChild(bar);
		}
		else if (players[i][1].state.staying) {
			let bar = document.createElement("p");
			bar.innerText = "Staying with " + players[i][1].value;
			foo.appendChild(bar);
		}
		else {
			let bar = document.createElement("p");
			bar.innerText = players[i][1].value;
			foo.appendChild(bar);
		}
		document.getElementById("players").appendChild(foo);
	}
});

socket.on("turn", (turn) => {
	let arrow = document.createElement("p");
	arrow.innerText = "<--";
	if (turn.name == "Dealer")
		document.getElementById("dealer").appendChild(arrow);
	else 
		document.getElementById("player" + turn.index).appendChild(arrow);
	document.getElementById("turn").innerText = turn.name;
});

function hit() {
	socket.emit("hit");
}

function stay() {
	socket.emit("stay");
}

function getImage(card) {
	let width = 71;
	let height = 97;
	if (card == 0) {
		let node = document.createElement("div");
		node.setAttribute("class", "card");
		node.setAttribute("style", `width: ${width}px; height: ${height}px; background: url(back.png); background-size: ${width}px ${height}px;`);
		return node;
	}
	let xBorder = 2;
	let yBorder = 1;
	let yOffSet = -1 * card.suit * (height + yBorder) - 1;
	let xOffSet = -1 * width;
	switch (card.value) {
		case "A":
			xOffSet *= 0;
			break;
		case "K":
			xOffSet *= 12;
			xOffSet -= 12 * xBorder;
			break;
		case "Q":
			xOffSet *= 11;
			xOffSet -= 11 * xBorder;
			break;
		case "J":
			xOffSet *= 10;
			xOffSet -= 10 * xBorder;
			break;
		default:
			xOffSet *= parseInt(card.value) - 1;
			xOffSet -= (parseInt(card.value) - 1) * xBorder;
	}
	xOffSet -= xBorder;
	let node = document.createElement("div");
	node.setAttribute("class", "card");
	node.setAttribute("style", `width: ${width}px; height: ${height}px; background: url(cards.png) ${xOffSet}px ${yOffSet}px;`);
	return node;
}