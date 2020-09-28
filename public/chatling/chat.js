let socket = io.connect("/");

$(".btn-default").click(() => {
	let msg = $(".form-control")[0].value;
	if (msg == "") return;
	$(".form-control")[0].value = "";
	socket.emit("messageChatling", {message: msg, time: Date.now()});
});

$(".form-control").keypress((e) => {
	if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
		$('.btn-default').click();
	}
});

if (window.height <= 768) {
	$(".form-control").on("click", () => {
		$(".panel-body")[0].scrollTo(0, $(".panel-body")[0].scrollHeight);
	});
}

socket.on("messageChatling", (data) => {
	updateMessages(data);
});

function updateMessages(data) {
	console.log(data);
	for (let i of data) {
		$(".container").append("<div class=\"row message-bubble border\"><p>‎</p></div>");
		$(".message-bubble").last().children().first().text(`${new Date(i.time).toLocaleString()} - ${i.message}`);
	}
	$(".panel-body")[0].scrollTo(0, $(".panel-body")[0].scrollHeight);
}

socket.on("onlineChatling", (data) => {
	$("#online").text(data);
});
