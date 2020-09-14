
let input_board = [];
let answer_board = [];
let hints = 40;

$(() => {

	start(window.location.search);
	
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
		start(null);
	});
	
	$("#import").click(() => {
		let board = $("#board").val();
		if (board.length === 81 && !isNaN(board)) start("?" + board);
	});
	
	$("#export").click(() => {
		$("#board").val(toSudokuString(input_board));
	});
	
	$("#url").click(() => {
		$("#board").val(window.location.origin + window.location.pathname + "?" + toSudokuString(input_board));
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
		start(null);
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

function start(param) {
	$("td").removeClass();
	input_board = [];
	answer_board = [];
	if (param === null || param.length !== 82 || isNaN(param.substring(1))) {
		initializeBoard(input_board);
		initializeBoard(answer_board);
		let h = hints;
		let list = sortedArray();
		answer_board[0] = list;
		$("td").css("color", "#000000");
		
		generate(answer_board);
		
		count = 0;

		hint(h, false);

		if (h >= 30) {
			let temp = [...input_board];
			let c = countSolutions(temp, 0, 0, 0);
			console.log(c);
			if (c != 1) start(param);
		}
	} else {
		input_board = toSudokuBoard(param.substring(1));
	}

	for (let i = 0; i < $("td").length; i++) {
		$("td")[i].innerText = "";
	}
	printBoard(input_board);
}