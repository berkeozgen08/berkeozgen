module.exports = (io, customAlphabet, app) => {
	const fetch = require("node-fetch");
	const editor = io.of("/editor");
	let ids = [];
	editor.on("connection", socket => {
		socket.on("join", data => {
			let { room, name } = data;
			let id = customAlphabet("0123456789", 10)();
			if (!room) {
				room = customAlphabet("abcdefghijklmnopqrstuvwxyz", 8)();
				socket.emit("joinURL", `https://berkeozgen.me/editor/?${room}`);
			}
			socket.join(room);
			socket.to(room).emit("notf", `${name} has joined.`);
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
			socket.on("disconnect", data => {
				editor.to(room).emit("online", (editor.adapter.rooms[room] || { length: 0 }).length);
				editor.to(room).emit("notf", `${name} has left.`);
				ids = ids.filter(i => i.id != id);
				editor.to(room).emit("removeCursor", id);
			});
		});
	});
	
	app.post("/editor/run", async (req, res) => {
		let CLIENT_SECRET = process.env.CLIENT_SECRET;
		let RUN_URL = "https://api.hackerearth.com/v3/code/run/";
		let req1 = await fetch(RUN_URL, {
			method: "POST",
			headers: {
				"content-type": "application/x-www-form-urlencoded"
			},
			body: `client_secret=${req.body.CLIENT_SECRET}&async=0&source=${req.body.source}&lang=${req.body.lang}&time_limit=5&memory_limit=262144`
		});
		let res1 = await req1.json();
		res.json(res1);
	});
};