
let input_board = [];
let answer_board = [];
let hints = 40;

$(() => {

	$("#info").fadeOut(8000);
	start(window.location.search.substring(1));
	
	$("td").click(function() {
		if ($(this).attr("class") == "org") 
			return;
		let v = prompt();
		if (isNaN(parseInt(v))) {
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
			removeLocalStorage();
		} else {
			updateLocalStorage();
		}
	});

	$("#hint").click(function() {
		hint(1, true);
		printBoard(input_board);
		updateLocalStorage();
	});

	$("#solve").click(function() {
		solve(input_board, 0, 0);
		console.log(legit(input_board));
		printBoard(input_board);
		removeLocalStorage();
	});

	let slider = document.getElementById("range");
	$("#hints").text(slider.value);
	slider.oninput = () => {
		$("#hints").text(slider.value);
	};

	$("#generate").click(() => {
		hints = slider.value;
		removeLocalStorage();
		start(null);
	});
	
	$("#import").click(() => {
		let board = $("#board").val();
		removeLocalStorage();
		if (board.length === 81 && !isNaN(board)) start(board);
	});
	
	const copyToClipboard = () => {
		let board = document.getElementById("board");
		if (board.value == "") return;
		board.select();
		board.setSelectionRange(0, 99999);
		document.execCommand("copy");
		alert("Copied");
	}
	
	$("#export").click(() => {
		$("#board").val(toSudokuString(input_board));
		copyToClipboard();
	});
	
	$("#url").click(() => {
		$("#board").val(window.location.origin + window.location.pathname + "?" + toSudokuString(input_board));
		copyToClipboard();
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
	if (param === null || param.length !== 81 || isNaN(param)) {
		if (localStorage.getItem("board") !== null) {
			start(localStorage.getItem("board"));
			return;
		}
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
		input_board = toSudokuBoard(param);
	}

	for (let i = 0; i < $("td").length; i++) {
		$("td")[i].innerText = "";
	}
	printBoard(input_board);
	updateLocalStorage();
}

function updateLocalStorage() {
	localStorage.setItem("board", toSudokuString(input_board));
}

function removeLocalStorage() {
	localStorage.removeItem("board");
}