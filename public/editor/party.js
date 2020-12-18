
let name;

const copy = text => {
	let input = document.createElement("input");
	input.value = text;
	input.style.zIndex = 9999;
	document.body.prepend(input);
	input.select();
	input.setSelectionRange(0, 99999);
	document.execCommand("copy");
	input.remove();
	createNotf("Copied.");
};

const urlify = text => {
	let urlRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
	return text.replaceAll(urlRegex, url => `<a target="_blank" href="${url}">${url}</a>`);
	// return text.replace(urlRegex, '<a href="$1">$1</a>')
}

if (window.innerWidth <= 500) {
	codeMirror.setOption("indentWithTabs", false);
}

let colors = ["rgb(45, 100, 255)", "rgb(252, 89, 64)", "rgb(189, 255, 191)", "rgb(255, 255, 0)", "rgb(51, 255, 252)", "rgb(255, 0, 255)", "rgb(255, 255, 255)"];
colors = colors.map(i => { return { color: i, used: false }; });
let users = new Map();

popupcontainer = document.querySelector(".popup-container");

const click = e => {
	popupcontainer.classList.add("active");
	document.querySelector(".container").classList.add("darken");
	document.getElementById("name").focus();
};

document.getElementById("submit").addEventListener("click", e => {
	popupcontainer.classList.remove("active");
	document.querySelector(".container").classList.remove("darken");
});

let autoSave = true;
let autoSaveInterval;

function switchButtons(socket) {
	let popup = popupcontainer.firstElementChild;
	Object.values(popup.children).forEach(i => i.remove());
	if (document.getElementById("party")) {
		document.getElementById("party").remove();
	}
	let options = document.createElement("button");
	options.innerText = "Options";
	options.id = "party";
	options.addEventListener("click", e => {
		popupcontainer.classList.add("active");
		document.querySelector(".container").classList.add("darken");
	});
	document.querySelector(".header").appendChild(options);
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
	setTimeout(() => {
		let invite = document.createElement("input");
		invite.type = "submit";
		invite.id = "submit";
		invite.value = "Copy Invitation";
		invite.addEventListener("click", e => {
			copy(url);
			popupcontainer.classList.remove("active");
			document.querySelector(".container").classList.remove("darken");
		});
		let save = document.createElement("input");
		save.type = "submit";
		save.id = "submit";
		save.value = "Save";
		save.addEventListener("click", e => {
			socket.emit("save", { text: codeMirror.getValue(), lang: document.querySelector("select").value });
			createNotf("Saved.");
			popupcontainer.classList.remove("active");
			document.querySelector(".container").classList.remove("darken");
		});
		let label = document.createElement("label");
		label.classList.add("switch");
		let input = document.createElement("input");
		input.type = "checkbox";
		let span = document.createElement("span");
		span.className = "slider";
		let autoSave = document.createElement("p");
		autoSave.innerHTML = "Auto Save";
		let hint = document.createElement("p");
		hint.innerText = "Saves get removed after 24 hours."
		hint.style.fontSize = "0.8rem";
		label.addEventListener("click", e => {
			if (autoSave) {
				clearInterval(autoSaveInterval);
			} else {
				autoSaveInterval = setInterval(() => {
					socket.emit("save", { text: codeMirror.getValue(), lang: document.querySelector("select").value });
					createNotf("Auto saved.");
				}, 180000);
			}
			autoSave = !autoSave;
		});
		label.appendChild(input);
		label.appendChild(span);
		popup.appendChild(invite);
		popup.appendChild(save);
		popup.appendChild(autoSave);
		popup.appendChild(label);
		popup.appendChild(hint);

		let ctrl = false;
		document.addEventListener("keydown", e => {
			switch (e.key) {
				case "Control":
					ctrl = true;
					break;
				case "s":
					if (ctrl) {
						e.preventDefault();
						socket.emit("save", { text: codeMirror.getValue(), lang: document.querySelector("select").value });
						createNotf("Saved.");
					}
			}
		});
		document.addEventListener("keyup", e => {
			if (e.key == "Control") {
				ctrl = false;
			}
		});
	}, 500);
}

let needsInitialization = true;

if (window.location.search) {
	popupcontainer.classList.add("active");
	document.querySelector(".container").classList.add("darken");
	document.getElementById("name").focus();
	document.getElementById("submit").addEventListener("click", e => {
		name = document.getElementById("name").value || "no name";
		join(window.location.search.substring(1), name, false);
		document.querySelector(".loader-container").classList.toggle("darken");
	});
	document.getElementById("submit").value = "Join";
	document.querySelector(".loader-container").classList.toggle("darken");
} else {
	let party = document.createElement("button");
	party.innerText = "Code Party";
	party.id = "party";
	document.querySelector(".header").appendChild(party);
	
	let roomInput = document.createElement("input");
	roomInput.type = "text";
	roomInput.name = "room";
	roomInput.id = "room";
	roomInput.placeholder = "Room name (optional)";
	roomInput.autocomplete = "off";
	let popup = document.querySelector(".popup");
	popup.insertBefore(roomInput, popup.children[1]);

	document.getElementById("party").addEventListener("click", click);

	document.getElementById("submit").addEventListener("click", e => {
		openLoader();
		name = document.getElementById("name").value || "no name";
		let roomInputValue = roomInput.value;
		if (roomInputValue) {
			roomInputValue = roomInputValue.split(" ").join("");
		}
		join(roomInputValue || undefined, name, true);
	});

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

	closeLoader();

	needsInitialization = false;
}

document.querySelectorAll("input").forEach(i => {
	i.addEventListener("keydown", e => {
		if (e.key == "Enter") {
			document.getElementById("submit").click();
		}
	});
});

const createNotf = message => {
	let notf = document.createElement("div");
	notf.classList.add("notification");
	notf.classList.add("slideIn");
	notf.innerHTML = urlify(message);
	notf.addEventListener("click", () => removeNotf(notf));
	setTimeout(() => removeNotf(notf), 5000);
	document.querySelector(".notification-container").appendChild(notf);
};

const removeNotf = notf => {
	notf.classList.remove("slideIn");
	setTimeout(() => notf.classList.add("slideOut"), 500);
	setTimeout(() => notf.remove(), 1000);
};

let url = window.location.href;

function failedJoin() {
	copy(codeMirror.getValue());
	document.querySelector(".error").innerHTML = "Failed to connect<br>Copied";
}

function join(room, name, create) {
	let socket = io.connect("/editor", {
		"transports": ["websocket"]
	});
	socket.on("connect", () => {
		closeLoader();
		document.querySelector(".error").classList.remove("active");
		document.querySelector(".error").innerHTML = "Failed to connect<br>Click here to copy the text";
	});
	socket.on("connect_error", () => {
		if (!document.querySelector(".loader-container.active")) {
			openLoader();
		}
		if (!document.querySelector(".error.active")) {
			document.querySelector(".error").classList.add("active");
		}
	});
	socket.on("load", data => {
		codeMirror.setValue(data.text);
		document.querySelector("select").value = data.lang;
		lang();
	});
	socket.emit("join", { room, name, create });
	socket.on("notf", data => {
		createNotf(data);
	});
	socket.on("joinURL", data => {
		createNotf(data);
		copy(data);
		let foo = document.createElement("div");
		foo.innerHTML = data;
		url = foo.innerText;
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
	let onlineUsers = document.createElement("div");
	let userList = document.createElement("ul");
	let self = document.createElement("li");
	self.style.listStyle = "none";
	self.innerText = name;
	userList.appendChild(self);
	users.forEach(u => {
		let user = document.createElement("li");
		user.innerText = u.name;
		userList.appendChild(user);
	});
	onlineUsers.appendChild(userList);
	online.addEventListener("mouseover", e => {
		onlineUsers.classList.add("active");
	});
	online.addEventListener("mouseout", e => {
		onlineUsers.classList.remove("active");
	});
	online.appendChild(onlineCount);
	online.appendChild(document.createElement("br"));
	online.appendChild(onlineUsers);
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
		let user = document.createElement("li");
		user.style.listStyle = "none";
		user.innerText = name;
		userList.appendChild(user);
		users.set(id, { name, marker: null, color, selection: null, initial: true, listElement: user });
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
			nameBox.style.zIndex = 9997;
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
		users.get(data).listElement.remove();
		users.delete(data);
	});

	initializeChat(socket);

	autoSaveInterval = setInterval(() => {
		socket.emit("save", { text: codeMirror.getValue(), lang: document.querySelector("select").value });
		createNotf("Auto saved.");
	}, 180000);

	switchButtons(socket);
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
	chatContainer.style.zIndex = "9997";
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
	arrow.style.padding = "16px 24px 16px 8px";
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
		blob.innerHTML = urlify(message);
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
		arrow.style.padding = "10px 24px 12px 4px";
		arrow.style.width = "30px";
		arrow.style.height = "30px";
		arrowText.style.fontSize = "20px";
		hover.style.height = "120px";
	} else {
		let notf = document.querySelector(".notification-container");
		notf.style.right = "100%";
		notf.style.position = "absolute";
		notf.style.alignSelf = "flex-end";
		notf.style.bottom = 0;
		notf.style.padding = "16px";
		notf.style.overflow = "hidden";
		chatContainer.appendChild(notf);
		arrowText.style.paddingBottom = "4px";
	}
}