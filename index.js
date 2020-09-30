const express = require("express");
const monk = require("monk");
const socket = require("socket.io");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({limit: "1kb"}));

const port =  process.env.PORT || 3000;
const server = app.listen(port, () => {
	console.log("listening at " + port);
});

const db = monk(process.env.MONGO);
const snakeDB = db.get("snake");
const chatlingDB = db.get("chatling");

const io = socket(server);

const blackjack = require(path.join(__dirname, "apps/blackjack.js"))(io);
const chatling = require(path.join(__dirname, "apps/chatling.js"))(io, chatlingDB);
const snake = require(path.join(__dirname, "apps/snake.js"))(app, snakeDB);

app.use((err, req, res, next) => {
	if (err.status) {
		res.status(err.status);
	} else {
		res.status(500);
	}
	res.json({
		message: err.message
	});
});