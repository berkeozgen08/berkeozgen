
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

let colors = ["rgb(45, 100, 255)", "rgb(252, 89, 64)", "rgb(189, 255, 191)", "rgb(255, 255, 0)", "rgb(51, 255, 252)", "rgb(255, 0, 255)", "rgb(255, 255, 255)"];
colors = colors.map(i => { return { color: i, used: false }; });
let users = new Map();

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
	document.getElementById("submit").value = "Join";
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
		join(undefined, document.getElementById("name").value || "no name");
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
		users.delete("")
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
		socket.emit("cursorActivity", e.doc.sel.ranges[0]);
	});
	const addCursor = (name, id) => {
		let color;
		if (onlineCount.innerText <= colors.length) {
			let rand = parseInt(Math.random() * colors.length);
			while (colors[rand].used) {
				rand = parseInt(Math.random() * colors.length);
			}
			color = colors[rand].color;
			colors[rand].used = true;
		} else {
			color = colors[parseInt(Math.random() * colors.length)].color;
		}
		users.set(id, { name, marker: null, color, selection: null, initial: true });
	};
	socket.on("cursorJoin", data => {
		let { name, id } = data;
		addCursor(name, id);
	});
	socket.on("cursorActivity", data => {
		let { anchor, head, name, id } = data;
		let user = users.get(id);
		if (user && user.marker) user.marker.clear();
		if (user && user.selection) user.selection.clear();
		let cursorCoords = codeMirror.cursorCoords(head, "local");
		let cursorElement = document.createElement("span");
		cursorElement.style.borderLeftStyle = "solid";
		cursorElement.style.borderLeftWidth = "2px";
		cursorElement.style.borderLeftColor = user.color;
		cursorElement.style.height = `${(cursorCoords.bottom - cursorCoords.top)}px`;
		cursorElement.style.padding = 0;
		cursorElement.style.zIndex = 0;
		cursorElement.style.position = "absolute";
		if (!user.nameBox) {
			let nameBox = document.createElement("h1");
			nameBox.innerText = name;
			nameBox.style.position = "absolute";
			nameBox.style.background = user.color;
			nameBox.style.color = "black";
			nameBox.style.padding = "4px";
			nameBox.style.userSelect = "none";
			nameBox.style.fontSize = "13px";
			nameBox.style.margin = 0;
			nameBox.style.zIndex = 9999;
			nameBox.style.boxShadow = "2px 2px #000000";
			nameBox.style.pointerEvents = "none";
			if (user.initial) {
				setTimeout(() => {
					nameBox.style.display = "none";
					user.initial = false;
				}, 3000);
			} else {
				nameBox.style.display = "none";
			}
			document.querySelector(".CodeMirror-scroll").appendChild(nameBox);
			nameBox.style.top = `${cursorCoords.bottom}px`;
			nameBox.style.left = `${codeMirror.cursorCoords(head).left}px`;
			user.nameBox = nameBox;
		}
		cursorElement.addEventListener("mouseover", e => {
			user.nameBox.style.display = "block";
			user.initial = true;
		});
		cursorElement.addEventListener("mouseout", e => {
			setTimeout(() => {
				user.nameBox.style.display = "none";
				user.initial = false;
			}, 3000);
		});
		user.nameBox.style.top = `${cursorCoords.bottom}px`;
		user.nameBox.style.left = `${codeMirror.cursorCoords(head).left}px`;
		user.marker = codeMirror.setBookmark(head, { widget: cursorElement });
		if (head.line > anchor.line || (head.line == anchor.line && head.ch > anchor.ch)) {
			user.selection = codeMirror.markText(anchor, head, { className: "CodeMirror-selected", css: `background: ${user.color.replace(")", ", 0.2)")}` });
		} else if (anchor.line > head.line || (head.line == anchor.line && anchor.ch > head.ch)) {
			user.selection = codeMirror.markText(head, anchor, { className: "CodeMirror-selected", css: `background: ${user.color.replace(")", ", 0.2)")}` });
		}
	});
	socket.on("currentCursors", data => {
		if (onlineCount.innerText > 1) {
			for (let i of data) {
				let { name, id } = i;
				addCursor(name, id);
			}
		}
	});
	socket.on("removeCursor", data => {
		let { marker, color, selection } = users.get(data);
		if (marker) marker.clear();
		if (selection) selection.clear();
		colors.forEach(i => { if (i.color == color) i.used = false; });
		users.delete(data);
	});
}