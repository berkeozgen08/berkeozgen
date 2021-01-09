module.exports = (io, customAlphabet, editorDB, app) => {
	const fetch = require("node-fetch");
	const editor = io.of("/editor");
	let ids = [];
	editor.on("connection", socket => {
		socket.on("join", data => {
			let { room, name, create } = data;
			let id = customAlphabet("0123456789", 10)();
			if (!room) {
				room = customAlphabet("abcdefghijklmnopqrstuvwxyz", 8)();
			}
			if (create) {
				socket.emit("joinURL", `https://berkeozgen.me/editor/?${room}`);
			}
			socket.join(room);
			socket.to(room).emit("notf", `${name} has joined.`);
			socket.on("notf", data => {
				socket.to(room).emit("notf", data);
			});
			editor.to(room).emit("online", (editor.adapter.rooms[room] || { length: 0 }).length);
			socket.on("change", data => {
				socket.to(room).emit("change", data);
			});
			socket.to(room).emit("needsInitialization", true);
			socket.on("initializeText", data => {
				socket.to(room).emit("initializeText", data);
			});
			socket.on("lang", data => {
				socket.to(room).emit("lang", data);
			});
			socket.to(room).emit("cursorJoin", { name, id });
			editor.to(socket.id).emit("currentCursors", ids.filter(i => i.room == room));
			ids.push({ id, name, room });
			socket.on("cursorActivity", data => {
				data.name = name;
				data.id = id;
				socket.to(room).emit("cursorActivity", data);
			});
			socket.on("message", data => {
				socket.to(room).emit("message", data);
			});
			socket.on("save", data => {
				editorDB.find({ room }).then(docs => {
					if (docs.length == 0) {
						editorDB.insert({ room });
					}
					editorDB.findOneAndUpdate({ room }, { $currentDate: { lastModified: true }, $set: { text: data.text, lang: data.lang } });
					socket.to(room).emit("notf", "Saved.");
				});
			});
			editorDB.findOne({ room }).then(doc => { if (doc) socket.emit("load", { text: doc.text, lang: doc.lang }); });
			socket.on("run", data => {
				socket.to(room).emit("run", data);
			});
			socket.on("disconnect", data => {
				editor.to(room).emit("online", (editor.adapter.rooms[room] || { length: 0 }).length);
				editor.to(room).emit("notf", `${name} has left.`);
				ids = ids.filter(i => i.id != id);
				editor.to(room).emit("removeCursor", id);
			});
		});
	});

	app.post("/editor/run", async (req, res) => {
		let req1 = await fetch("https://compile-java.herokuapp.com", {
			method: "POST",
			headers: {
				"content-type": "application/json"
			},
			body: JSON.stringify(req.body)
		});
		let res1 = await req1.json();
		res.json(res1);
	});
};