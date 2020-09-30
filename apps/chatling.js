module.exports = (io, chatlingDB) => {
	const chatling = io.of("/chatling");

	chatling.on("connection", (socket) => {
		socket.on("message", data => {
			chatlingDB.insert(data);
			chatling.emit("message", [data]);
		});
		chatling.emit("online", Object.keys(chatling.sockets).length);
		chatlingDB.find()
			.catch(err => {
				res.sendStatus(500);
				next(err);
			})
			.then((data) => {
				socket.emit("message", data);
			});
		socket.on("disconnect", () => {
			chatling.emit("online", Object.keys(chatling.sockets).length);
		});
	});
};