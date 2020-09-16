let socket = io.connect("/"); // connect to server || u can use io("url") too doesn't matter

// let data = 0;

// socket.emit("asd", data); // send data under a name

$(".btn-default").click(function(){
	let msg = $(".form-control")[0].value;
	if (msg == "") return;
	$(".form-control")[0].value = "";
	socket.emit("messageChatling", msg);
});

$(".form-control").keypress(function (e) { // for enter key to send
	if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
		$('.btn-default').click();
	}
});

socket.on("messageChatling", (data) => {
	updateMessages(data);
});

function updateMessages(data) {
	for (let i = 0; i < $(".message-bubble").length - 1; i++) {
		$(".message-bubble").eq(i).children().first().text($(".message-bubble").eq(i + 1).text());
	}
	$(".message-bubble").last().children().first().text(data);
}

socket.on("onlineChatling", (data) => {
	$("#online").text(data);
});

$(() => {
	for (let i = 0; i < ($(window).height() - 84.4) / 60 - 1; i++) {
		$(".container").append("<div class=\"row message-bubble border\"><p>‎</p></div>");
	}
});
