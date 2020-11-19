const express = require("express");
const monk = require("monk");
const socket = require("socket.io");
const path = require("path");
const favicon = require("serve-favicon");
const hsts = require("hsts");
const { customAlphabet } = require("nanoid");
require("dotenv").config();

const app = express();

app.use(hsts());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({limit: "1kb"}));
app.use(favicon(path.join(__dirname, "public", "images", "favicon.ico")));

const port =  process.env.PORT || 3000;
const server = app.listen(port, () => {
	console.log("listening at " + port);
});

const db = monk(process.env.MONGO);
const snakeDB = db.get("snake");
const chatlingDB = db.get("chatling");
const urlDB = db.get("url");
const editorDB = db.get("editor");

const io = socket(server);

const blackjack = require(path.join(__dirname, "apps", "blackjack.js"))(io);
const chatling = require(path.join(__dirname, "apps", "chatling.js"))(io, chatlingDB);
const snake = require(path.join(__dirname, "apps", "snake.js"))(app, snakeDB);
const urlshortener = require(path.join(__dirname, "apps", "urlshortener.js"))(app, urlDB);
const editor = require(path.join(__dirname, "apps", "editor.js"))(io, customAlphabet, editorDB);

const notFound = path.join(__dirname, "public", "404.html");
app.use((req, res, next) => {
	res.status(404).sendFile(notFound);
});

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