
const copy = text => {
	let input = document.createElement("input");
	input.value = text;
	document.body.appendChild(input);
	input.select();
	input.setSelectionRange(0, 99999);
	document.execCommand("copy");
	input.remove();
	createNotf("Copied.");
};

if (window.innerWidth <= 500) {
	codeMirror.setOption("indentWithTabs", false);
}

popupcontainer = document.querySelector(".popup-container");

document.getElementById("submit").addEventListener("click", async e => {
	popupcontainer.classList.remove("active");
});

document.querySelectorAll("input").forEach(i => {
	i.addEventListener("keydown", e => {
		if (e.key == "Enter") {
			document.getElementById("submit").click();
		}
	});
});

let needsInitialization = true;

if (window.location.search) {
	popupcontainer.classList.add("active");
	document.getElementById("name").focus();
	document.getElementById("submit").addEventListener("click", e => {
		join(window.location.search.substring(1), document.getElementById("name").value || "no name");
	});
	let invite = document.createElement("button");
	invite.innerText = "Copy Invitation";
	invite.id = "party";
	invite.addEventListener("click", e => {
		copy(window.location.href);
	});
	document.querySelector(".header").appendChild(invite);
} else {
	let party = document.createElement("button");
	party.innerText = "Code Party";
	party.id = "party";
	document.querySelector(".header").appendChild(party);
	
	popupcontainer.addEventListener("click", e => {
		if (e.target == popupcontainer) {
			popupcontainer.classList.remove("active");
		}
	});
	
	popupcontainer.addEventListener("keydown", e => {
		if (e.key == "Escape") {
			popupcontainer.classList.remove("active");
		}
	});

	const click = e => {
		popupcontainer.classList.add("active");
		document.getElementById("name").focus();
	};

	document.getElementById("party").addEventListener("click", click);

	document.getElementById("submit").addEventListener("click", e => {
		join(undefined, document.getElementById("name").value);
		let party = document.getElementById("party");
		party.innerText = "Copy Invitation";
		party.removeEventListener("click", click);
		party.addEventListener("click", e => {
			copy(url);
		});
	});

	needsInitialization = false;
}

function createNotf(message) {
	let notf = document.createElement("div");
	notf.classList.add("notification");
	notf.innerHTML = message;
	setTimeout(() => notf.remove(), 5000);
	document.querySelector(".notification-container").appendChild(notf);
}

let url;

function join(room, name) {
	let socket = io.connect("/editor", {
		"transports": ["websocket"]
	});
	socket.emit("join", { room, name });
	socket.on("notf", data => {
		createNotf(data);
		if (data.includes("</a>")) {
			let node = document.createElement("div");
			node.innerHTML = data;
			url = node.innerText;
			copy(url);
		}
	});
	let detectChange = true;
	codeMirror.on("change", (ce, e) => {
		if (detectChange && !needsInitialization) {
			socket.emit("change", e);
		}
	});
	socket.on("change", data => {
		detectChange = false;
		let { from, origin, removed, text, to } = data;
		// if (window.innerWidth <= 500) {
		// 	text = text.map(i => i.replaceAll("\t", "    "));
		// }
		codeMirror.replaceRange(text, from, to, origin);
		detectChange = true;
	});
	let online = document.createElement("h1");
	online.innerText = "Online: ";
	let onlineCount = document.createElement("span");
	onlineCount.innerText = 0;
	online.appendChild(onlineCount);
	document.querySelector(".header").appendChild(online);
	socket.on("online", data => {
		onlineCount.innerText = data;
		if (data <= 1) needsInitialization = false;
	});
	socket.on("needsInitialization", data => {
		if (data) {
			socket.emit("initializeText", codeMirror.getValue());
			socket.emit("lang", document.querySelector("select").value);
		}
	});
	socket.on("initializeText", data => {
		if (needsInitialization) {
			// if (window.innerWidth <= 500) {
			// 	data = data.replaceAll("\t", "    ");
			// }
			codeMirror.setValue(data);
			needsInitialization = false;
		}
	});
	document.querySelector("select").addEventListener("change", function (e) {
		socket.emit("lang", this.value);
	});
	socket.on("lang", data => {
		document.querySelector("select").value = data;
		lang();
	});
	codeMirror.on("cursorActivity", e => {
		console.log(e.doc.sel.ranges[0]);
	});
}