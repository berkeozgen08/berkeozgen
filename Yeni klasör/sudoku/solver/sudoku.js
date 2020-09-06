
function check(row, column, board) {

	let number = board[row][column];
	
	for (let i = 0; i < 9; i++) {
		if (number === board[row][i] && i !== column) {
		console.log("c");
			return false;}
		if (number === board[i][column] && i !== row){
		console.log("r");
			return false;}
	}

	
	// check square
	let square_start_r = parseInt(row / 3) * 3;
	let square_start_c = parseInt(column / 3) * 3;
	// console.log(square_start_r, square_start_c);

	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			if ((square_start_r + i !== row || square_start_c + j !== column) && number === board[square_start_r + i][square_start_c + j]) {
				console.log("s");
				return false;
			}
		}
	}

	return true;

}

function possible(row, column, board, number) {
	
	for (let i = 0; i < 9; i++) {
		if (number === board[row][i] && i !== column) {
		// console.log("r");
			return false;}
		if (number === board[i][column] && i !== row){
		// console.log("c");
			return false;}
	}

	
	// check square
	let square_start_r = parseInt(row / 3) * 3;
	let square_start_c = parseInt(column / 3) * 3;
	// console.log(square_start_r, square_start_c);

	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			if ((square_start_r + i !== row || square_start_c + j !== column) && number === board[square_start_r + i][square_start_c + j]) {
				// console.log("s");
				return false;
			}
		}
	}

	return true;

}

function legit(board) {
	for (let i = 0; i < 9; i++) {
		for (let j = 0; j < 9; j++) {
			if (!check(i, j, board))
				return false;
		}
	}
	return true;
}

function solve(board, r, c) {
	let i = r;
	let j = c;
	// console.log("ran");
	if (j == 9) {
		i++;
		j = 0;
	}
	console.log(i, j);
	if (i > 8) {
		console.log("finished");
		return;
	}
	else if (board[i][j] === 0) {
		for (let k = 1; k < 10; k++) {
			if (possible(i, j, board, k)) {
				board[i][j] = k;
				console.log("Placed:", k, "at", i, j);
				solve(board, i, j+1);
				if (!legit(board))
					board[i][j] = 0; // backtracking
			}
		}
		console.log("backtracked to", i, j-1);
		return;
	}
	else {
		console.log("tile not empty");
		solve(board, i, j+1);
	}
	
}

function sortedArray() {
	let list = [1, 2, 3, 4, 5, 6, 7, 8, 9];
	list = list.sort(() => Math.random() - 0.5);
	return list;
}

function printBoard(board) {

	$("td").text("");
	for (let i = 0; i < 9; i++) {
		for (let j = 0; j < 9; j++) {
			if (board[i][j] == 0)
				continue;
			$("td")[parseInt(i / 3) * 27 + (i % 3) * 3 + parseInt(j / 3) * 9 + (j % 3)].innerText = board[i][j];
		}
	}

}

function initializeBoard(board) {

	for (let i = 0; i < 9; i++) {
		board.push([]);
		for (let j = 0; j < 9; j++) {
			board[i].push(0);
		}
	}
	return board;
}