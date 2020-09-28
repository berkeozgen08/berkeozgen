
let max = 265 / 47 - 1;

// let data = 0;

$(".btn-default").click(function(){
	let msg = $(".form-control")[0].value;
	if (msg == "") return;
	parent.sendMessage(msg);
	$(".form-control")[0].value = "";
});

$(".form-control").keypress(function (e) { // for enter key to send
	if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
		$('.btn-default').click();
	}
});

let count = 0;
function updateMessages(data) {
	if (count > max) {
		$(".cont").append("<div class=\"row message-bubble border\"><p>‎" + data + "</p></div>");
		$(".panel-body")[0].scrollTo(0, $(".panel-body")[0].scrollHeight);
		return;
	}
	for (let i = 0; i < $(".message-bubble").length - 1; i++) {
		$(".message-bubble").eq(i).children().first().text($(".message-bubble").eq(i + 1).text());
	}
	$(".message-bubble").last().children().first().text(data);
	count++;
	$(".panel-body")[0].scrollTo(0, $(".panel-body")[0].scrollHeight);
}

$(() => {
	for (let i = 0; i < max; i++) {
		$(".cont").append("<div class=\"row message-bubble border\"><p>‎</p></div>");
	}
});
