
let answer_board = [];

$(() => {

	initializeBoard(answer_board);
	$("td").click(function() {
		let v = prompt();
		if (isNaN(parseInt(v))) {
			$(this).text("");
			$(this).css("color", "#000000");
			return;
		}
		else if (parseInt(v) < 1 || parseInt(v) > 9) {
			$(this).text("");
			$(this).css("color", "#000000");
			return;
		}
		$(this).text(v);
		$(this).css("color", "#4a90e2");
		copy(answer_board);
		printBoard(answer_board);
	});

	let first = true;
	$("button").click(function() {
		let empty = true;
		for (let i = 0; i < $("td").length; i++) {
			if ($($("td")[i]).innerText != " ")
				empty = false;
		}
		if (!empty && first) {
			let line = sortedArray();
			answer_board[0] = line;
			first = false;
		} 
		solve(answer_board, 0, 0);
		console.log(legit(answer_board));
		printBoard(answer_board);
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
