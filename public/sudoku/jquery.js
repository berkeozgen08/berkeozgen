
let input_board = [];
let answer_board = [];
let hints = 40;

$(() => {

	start();
	
	$("td").click(function() {
		let v = prompt();
		if ($(this).attr("class") == "org") 
			return;
		else if (isNaN(parseInt(v))) {
			$(this).text("");
			return;
		}
		else if (parseInt(v) < 1 || parseInt(v) > 9) {
			$(this).text("");
			return;
		}
		$(this).text(v);
		$(this).css("color", "#4a90e2");
		copy(input_board);
		printBoard(input_board);
		if (finished(input_board)) {
			alert("congrats peasant");
		}
	});

	$("#hint").click(function() {
		hint(1, true);
		printBoard(input_board);
	});

	$("#solve").click(function() {
		solve(input_board, 0, 0);
		console.log(legit(input_board));
		printBoard(input_board);
	});

	let slider = document.getElementById("range");
	$("#hints").text(slider.value);
	slider.oninput = () => {
		$("#hints").text(slider.value);
	};

	$("#generate").click(() => {
		hints = slider.value;
		start();
	});
	
});

function copy(board) {
	let arr = $("td");
	let square = 0;
	for (let i = 0; i < arr.length; i++) {
		square = parseInt(i / 9);
		if (arr[i].innerText == "")
			board[parseInt((i % 9) / 3) + parseInt(i / 27) * 3][(i % 9) % 3 + (square % 3) * 3] = 0;
		else 
			board[parseInt((i % 9) / 3) + parseInt(i / 27) * 3][(i % 9) % 3 + (square % 3) * 3] = parseInt(arr[i].innerText);
	}
}

function hint(h, bool) {
	if (finished(input_board)) {
		start();
		return;
	}
	for (; h > 0; h--) {
		let r = Math.floor(Math.random() * 9);
		let c = Math.floor(Math.random() * 9);
		if (input_board[r][c] == 0) {
			input_board[r][c] = answer_board[r][c];
			$($("td")[parseInt(r / 3) * 27 + (r % 3) * 3 + parseInt(c / 3) * 9 + (c % 3)])
				.addClass("org");
			if(bool)
				$($("td")[parseInt(r / 3) * 27 + (r % 3) * 3 + parseInt(c / 3) * 9 + (c % 3)])
					.css("color", "#fb3d3f");
		}
		else h++;
	}
}

function start() {
	$("td").removeClass();
	input_board = [];
	answer_board = [];
	let h = hints;
	initializeBoard(input_board);
	initializeBoard(answer_board);
	let list = sortedArray();
	answer_board[0] = list;
	$("td").css("color", "#000000");

	while (answer_board[8][8] == 0) {
		answer_board = [];
		initializeBoard(answer_board);
		list = sortedArray();
		answer_board[0] = list;
		generate(answer_board);
	}
	console.log(legit(answer_board));

	hint(h, false);
	for (let i = 0; i < $("td").length; i++) {
		$("td")[i].innerText = "";
	}
	printBoard(input_board);
}