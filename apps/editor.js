module.exports = (io, customAlphabet) => {
	const editor = io.of("/editor");
	let ids = [];
	editor.on("connection", socket => {
		socket.on("join", data => {
			let { room, name } = data;
			let id = customAlphabet("0123456789", 10)();
			if (!room) {
				room = customAlphabet("abcdefghijklmnopqrstuvwxyz", 8)();
				socket.emit("joinURL", `<a target="_blank" href="https://berkeozgen.me/editor/?${room}">https://berkeozgen.me/editor/?${room}</a>`);
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
			editor.to(socket.id).emit("currentCursors", ids);
			ids.push({ id, name });
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
};