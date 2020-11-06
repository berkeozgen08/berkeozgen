
let name;

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
	document.querySelector(".container").classList.remove("darken");
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
	document.querySelector(".container").classList.add("darken");
	document.getElementById("name").focus();
	document.getElementById("submit").addEventListener("click", e => {
		name = document.getElementById("name").value || "no name";
		join(window.location.search.substring(1), name);
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
			document.querySelector(".container").classList.remove("darken");
		}
	});
	
	popupcontainer.addEventListener("keydown", e => {
		if (e.key == "Escape") {
			popupcontainer.classList.remove("active");
			document.querySelector(".container").classList.remove("darken");
		}
	});

	const click = e => {
		popupcontainer.classList.add("active");
		document.querySelector(".container").classList.add("darken");
		document.getElementById("name").focus();
	};

	document.getElementById("party").addEventListener("click", click);

	document.getElementById("submit").addEventListener("click", e => {
		name = document.getElementById("name").value || "no name";
		join(undefined, name);
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
	});
	socket.on("joinURL", data => {
		createNotf(data);
		let node = document.createElement("div");
		node.innerHTML = data;
		url = node.innerText;
		copy(url);
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

	initializeChat(socket);
}

function initializeChat(socket) {
	let chatContainer = document.createElement("div");
	chatContainer.classList.add("chat-container");
	chatContainer.style.backgroundColor = "#1f2329";
	chatContainer.style.position = "fixed";
	chatContainer.style.top = 0;
	chatContainer.style.left = "100%";
	chatContainer.style.margin = 0;
	chatContainer.style.width = "400px";
	chatContainer.style.height = "100%";
	chatContainer.style.zIndex = "9999";
	chatContainer.style.display = "flex";
	chatContainer.style.alignItems = "center";

	let hover = document.createElement("div");
	hover.style.margin = 0;
	hover.style.position = "absolute";
	hover.style.right = "100%";
	hover.style.width = "auto";
	hover.style.height = "auto";
	hover.style.display = "flex";
	hover.style.alignItems = "center";
	hover.style.overflow = "hidden";

	let arrow = document.createElement("div");
	arrow.classList.add("chat-arrow");
	arrow.style.backgroundColor = "#1f2329";
	arrow.style.color = "#d1daeb";
	arrow.style.borderRadius = "50%";
	arrow.style.padding = "16px";
	arrow.style.width = "50px";
	arrow.style.height = "50px";
	arrow.style.display = "flex";
	arrow.style.alignItems = "center";
	arrow.style.margin = 0;
	arrow.style.position = "relative";
	arrow.style.right = "-100%";
	arrow.style.userSelect = "none";
	arrow.style.cursor = "pointer";
	let arrowText = document.createElement("p");
	arrowText.classList.add("chat-arrow-text");
	arrowText.innerText = "<";
	arrowText.style.fontSize = "30px";
	arrow.appendChild(arrowText);

	const openArrow = e => {
		arrow.classList.add("active");
	};
	const closeArrow = e => {
		arrow.classList.remove("active");
	};
	const closeChatContainer = function (e) {
		chatContainer.classList.remove("active");
		hover.addEventListener("mouseleave", closeArrow);
		arrowText.classList.remove("active");
		document.querySelector(".container").classList.remove("darken");
		closeArrow(e);
		this.removeEventListener("click", closeChatContainer);
		arrow.removeEventListener("click", closeChatContainer);
	};

	hover.addEventListener("mouseover", openArrow);
	hover.addEventListener("mouseleave", closeArrow);
	arrow.addEventListener("click", e => {
		document.querySelector(".container").classList.add("darken");
		chatContainer.classList.add("active");
		arrowText.classList.add("active");
		hover.removeEventListener("mouseleave", closeArrow);
		document.querySelector(".container").addEventListener("click", closeChatContainer);
		arrow.addEventListener("click", closeChatContainer);
	});

	let inputs = document.createElement("div");
	inputs.style.alignSelf = "flex-end";
	inputs.style.minWidth = "100%";
	inputs.style.minHeight = "1%";
	inputs.style.display = "flex";
	inputs.style.position = "absolute";

	let input = document.createElement("input");
	input.style.alignSelf = "flex-end";
	input.placeholder = "Type a message.";
	input.style.padding = "8px";
	input.style.margin = "16px 4px 16px 16px";

	let send = document.createElement("button");
	send.innerText = "Send";
	send.style.padding = "8px";
	send.style.margin = "16px 16px 16px 4px";
	send.style.cursor = "pointer";
	send.addEventListener("click", e => {
		if (input.value == "") return;
		let message = `${name}: ${input.value}`;
		socket.emit("message", message);
		addBlob(message);
		input.value = "";
		chat.scrollTo(0, chat.scrollHeight);
	});
	input.addEventListener("keydown", e => {
		if (e.key == "Enter") {
			send.click();
		}
	});

	let chat = document.createElement("div");
	chat.classList.add("chat");
	chat.style.minWidth = "100%";
	chat.style.maxHeight = "calc(100% - 69.6px)";
	chat.style.position = "absolute";
	chat.style.overflow = "scroll";
	chat.style.overflowX = "hidden";
	chat.style.bottom = "69.6px";
	
	let blobContainer = document.createElement("div");
	blobContainer.style.display = "flex";
	blobContainer.style.flexDirection = "column";

	const addBlob = message => {
		let blob = document.createElement("div");
		blob.classList.add("chat-blob");
		blob.style.width = "auto";
		blob.style.padding = "16px";
		if (window.innerWidth >= 768) {
			blob.style.margin = "4px 12px 4px 16px";
		} else {
			blob.style.margin = "4px 16px 4px 16px";
		}
		blob.style.userSelect = "unset";
		blob.style.wordBreak = "break-word";
		blob.innerText = message;
		blobContainer.appendChild(blob);
	};

	let audio = document.createElement("audio");
	audio.volume = 0.1;
	let source = document.createElement("source");
	source.src = "message.mp3";
	
	socket.on("message", data => {
		if (!chatContainer.classList.contains("active")) {
			createNotf(data);
		}
		audio.play();
		addBlob(data);
		chat.scrollTo(0, chat.scrollHeight);
	});

	hover.appendChild(arrow);
	inputs.appendChild(input);
	inputs.appendChild(send);
	chat.appendChild(blobContainer);
	chatContainer.appendChild(hover);
	chatContainer.appendChild(chat);
	chatContainer.appendChild(inputs);
	document.body.appendChild(chatContainer);
	audio.appendChild(source);
	document.body.appendChild(audio);

	openArrow();
	setTimeout(() => {
		if (!chatContainer.classList.contains("active") && !hover.querySelector(":hover")) {
			closeArrow();
		}
	}, 3000);

	if (window.innerWidth < 768) {
		chatContainer.style.width = "90%";
		arrow.style.padding = "12px";
		arrow.style.width = "30px";
		arrow.style.height = "30px";
		arrowText.style.fontSize = "20px";
		hover.style.height = "60px";
	} else {
		let notf = document.querySelector(".notification-container");
		notf.style.right = "calc(100% + 16px)";
		notf.style.position = "absolute";
		notf.style.alignSelf = "flex-end";
		chatContainer.appendChild(notf);
		arrowText.style.paddingBottom = "4px";
	}
}