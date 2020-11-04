const nanoid = require("nanoid");

module.exports = (io, customAlphabet) => {
	const editor = io.of("/editor");

	editor.on("connection", socket => {
		socket.on("join", data => {
			let { room, name } = data;
			if (!room) {
				room = customAlphabet("abcdefghijklmnopqrstuvwxyz", 8)();
				socket.emit("notf", `<a target="_blank" href="https://berkeozgen.me/editor/?${room}">https://berkeozgen.me/editor/?${room}</a>`);
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
			})
			socket.on("disconnect", data => {
				editor.to(room).emit("online", (editor.adapter.rooms[room] || { length: 0 }).length);
				editor.to(room).emit("message", `${name} has left.`);
			});
		});
	});
};