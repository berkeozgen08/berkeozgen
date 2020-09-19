const socket = io.connect("/",{
	"transports": ['websocket']
 });

let name = prompt("Enter your name") || "no name";
socket.emit("name", name);

function sendMessage(msg) {
	socket.emit("message", name + ": " + msg);
	document.getElementById("chatling").contentWindow.updateMessages(name + ": " + msg);
}

socket.on("message", (data) => {
	let inner = document.getElementById("chatling").contentWindow;
	inner.updateMessages(data);
	document.getElementById("message").play();
	let unread = inner.document.getElementById("unread");
	let frame = document.getElementById("frame");
	if (frame.getAttribute("show") == "no") {
		let notf = document.getElementById("notf");
		notf.innerText = ++unread.innerText;
		$("#notf").fadeIn(100);
	}
});

socket.on("self", (player) => {
	document.getElementById("name").innerText = player.name;
});

let slided = true;
let time = 25;
let timer = setInterval(() => {
	document.getElementById("time").innerText = --time;
	if (time <= 0) {
		stand();
	}
}, 1000);

// socket.on("online", (players) => {
// 	let str = "";
// 	for (let i of players) {
// 		str += i[1].name + ", ";
// 	}
// 	if (players.length == 0) str = "0";
// 	document.getElementById("online").innerText = str.substring(0, str.length > 2 ? str.length - 2 : str.length);
// });

socket.on("dealer", (dealer) => {
	let node = document.getElementById("dealer");
	while (node.firstChild)
		node.removeChild(node.lastChild);
	
	let foo = document.createElement("h3");
	foo.innerText = "Dealer";
	foo.setAttribute("class", "name");
	document.getElementById("dealer").appendChild(foo);

	let cards = document.createElement("div");
	cards.setAttribute("class", "cards");

	for (let i = 0; i < dealer.cards.length; i++) {
		if (i == 0 && !dealer.shown)
			cards.appendChild(getImage(0));
		else
			cards.appendChild(getImage(dealer.cards[i]));
	}

	document.getElementById("dealer").appendChild(cards);

	let bar = document.createElement("p");
	bar.innerText = "Dealer has " + dealer.value;
	document.getElementById("dealer").appendChild(bar);

});

let scores = new Map();

socket.on("players", (players) => {
	let node = document.getElementById("players");
	while (node.firstChild)
		node.removeChild(node.lastChild);

	for (let i = 0; i < players.length; i++) {
		let foo = document.createElement("div");
		foo.setAttribute("id", "player" + players[i][1].index);

		if (!scores.has(players[i][1].name)) scores.set(players[i][1].name, 0);

		let name = document.createElement("h3");
		name.innerText = players[i][1].name + ` (${scores.get(players[i][1].name)})`;
		// name.innerText = players[i][1].name;
		name.setAttribute("class", "name");
		foo.appendChild(name);

		let cards = document.createElement("div");
		cards.setAttribute("class", "cards");

		for (let j = 0; j < players[i][1].cards.length; j++) {
			cards.appendChild(getImage(players[i][1].cards[j]));
		}

		foo.appendChild(cards);
		
		if (players[i][1].state.bust) {
			let bar = document.createElement("p");
			bar.innerText = "Bust with " + players[i][1].value;
			foo.appendChild(bar);
		}
		else if (players[i][1].state.won) {
			let bar = document.createElement("p");
			bar.innerText = "Won with " + players[i][1].value;
			foo.appendChild(bar);
			
			scores.set(players[i][1].name, scores.get(players[i][1].name) + 1);
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
		else if (players[i][1].state.standing) {
			let bar = document.createElement("p");
			bar.innerText = "Standing with " + players[i][1].value;
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
	time = 25;
	for (let i of document.getElementsByClassName("name"))
		i.style.color = "white";
	if (turn.name == "Dealer")
		document.getElementById("dealer").children[0].style.color = "red";
	else 
		document.getElementById("player" + turn.index).children[0].style.color = "red";
	document.getElementById("turn").innerText = turn.name;
});

function hit() {
	socket.emit("hit");
}

function stand() {
	socket.emit("stand");
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

$(() => {
	// $("#notf").hide();
	document.getElementById("message").volume = 0.1;
	$("#chatslider").click(() => {
		if (slided) {
			$("#frame").animate({
				bottom: "+=303"
			}, 1000);
			slided = false;
			$("#unread", $("#chatling")[0].contentWindow.document).text("0");
			$("#notf").fadeOut(200);
			$("#frame").attr("show", "yes");
		} else {
			$("#frame").animate({
				bottom: "-=303" 
			}, 1000);
			slided = true;
			$("#frame").attr("show", "no");
		}
	});
	let n = document.createElement("meta");
	n.setAttribute("name", "viewport");
	n.setAttribute("content", `width=device-width, initial-scale=${document.getElementsByTagName("html")[0].clientWidth / 480}`);
	document.getElementsByTagName("head")[0].appendChild(n);
});