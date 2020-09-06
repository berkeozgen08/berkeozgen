let WIDTH;
let HEIGHT;
let SIZE;
let TABLE = [];
let MINES;
let SHOWING = [];
let CLICKED = [];
let FLAG = false;

$(() => {


	getDiff();
	initializeTable();
	generateTable();

	$("meta").attr("content", `width=${WIDTH}`);
	$("#flag").css("width", $("table").css("width")).css("height", 30);
	
	$("td").click(function() {

		if (FLAG) {
			if ($(this).text() == "")
				$(this).text("🏳‍🌈").css("background-color", "greenyellow");
			else
				$(this).text("").css("background-color", "white");
		} else {
			$(this).css("background-color", "rgb(184, 184, 184)");
			copy();
			print();
		}

	});

});

// function restart() {
// 	$("table").empty();
// 	TABLE = [];
// 	SHOWING = [];
// 	CLICKED = [];
// 	FLAG = false;
// 	initializeTable();
// 	generateTable();
// }

function getDiff() {
	let diff = prompt("1 - 2 - 3");
	let mine_percentage;
	switch (diff) {
		case '1':
			WIDTH = 480;
			HEIGHT = 600;
			SIZE = 40;
			mine_percentage = 10;
			break;
		case '2':
			WIDTH = 540;
			HEIGHT = 600;
			SIZE = 30;
			mine_percentage = 15;
			break;
		case '3':
			WIDTH = 600;
			HEIGHT = 600;
			SIZE = 20;
			mine_percentage = 20;
			break;
		default:
			getDiff();
	}
	MINES = Math.floor(WIDTH * HEIGHT / SIZE / SIZE * mine_percentage / 100);
}

function initializeTable() {
	for (let i = 0; i < HEIGHT / SIZE; i++) {
		TABLE.push([]);
		SHOWING.push([]);
		CLICKED.push([]);
		$("table").append($("<tr></tr>"));
		for (let j = 0; j < WIDTH / SIZE; j++) {
			TABLE[i].push(0);
			SHOWING[i].push(null);
			CLICKED[i].push(false);
			$("tr").last().append($("<td></td>").css("width", SIZE).css("height", SIZE));
		}
	}
}

function generateTable() {

	let mines = MINES;
	
	while (mines > 0) {
		let x = Math.floor(Math.random() * (HEIGHT / SIZE));
		let y = Math.floor(Math.random() * (WIDTH / SIZE));
		if (TABLE[x][y] != 0) {
			continue;
		} else {
			TABLE[x][y] = -1;
			mines--;
		}
	}

	for (let i = 0; i < HEIGHT / SIZE; i++) {
		for (let j = 0; j < WIDTH / SIZE; j++) { 
			mineCount(i,j); 
		}
	}

}

function mineCount(x, y) {
	
	if (TABLE[x][y] != -1) return;

	if (y > 0 && TABLE[x][y - 1] != -1) {
		TABLE[x][y - 1]++;
	}
	if (y < WIDTH / SIZE - 1 && TABLE[x][y + 1] != -1) {
		TABLE[x][y + 1]++;
	}
	if (x > 0 && TABLE[x - 1][y] != -1) {
		TABLE[x - 1][y]++;
	}
	if (x < HEIGHT / SIZE - 1 && TABLE[x + 1][y] != -1) {
		TABLE[x + 1][y]++;
	}
	if (x > 0 && y > 0 && TABLE[x - 1][y - 1] != -1) {
		TABLE[x - 1][y - 1]++;
	}
	if (x < HEIGHT / SIZE - 1 && y > 0 && TABLE[x + 1][y - 1] != -1) {
		TABLE[x + 1][y - 1]++;
	}
	if (x < HEIGHT / SIZE - 1 && y < WIDTH / SIZE - 1 && TABLE[x + 1][y + 1] != -1) {
		TABLE[x + 1][y + 1]++;
	}
	if (y < WIDTH / SIZE - 1 && x > 0 && TABLE[x - 1][y + 1] != -1) {
		TABLE[x - 1][y + 1]++;
	}

}

function onClick(x, y) {

	if (TABLE[x][y] != 0) {
		if (TABLE[x][y] != -1) {
			SHOWING[x][y] = TABLE[x][y];
			CLICKED[x][y] = true;
			$($("td")[x * WIDTH / SIZE + y]).css("background-color", "rgb(184, 184, 184)");
		}
		else {
			printt();
			$($("td")[x * WIDTH / SIZE + y]).text("💣").css("background-color", "red");
			return;
		}
	}
	if (SHOWING[x][y] != null) return;

	SHOWING[x][y] = TABLE[x][y];
	CLICKED[x][y] = true;
	$($("td")[x * WIDTH / SIZE + y]).css("background-color", "rgb(184, 184, 184)");

	if (y > 0 && TABLE[x][y - 1] != -1) {
		onClick(x, y - 1);
	}
	if (y < WIDTH / SIZE - 1 && TABLE[x][y + 1] != -1) {
		onClick(x, y + 1);
	}
	if (x > 0 && TABLE[x - 1][y] != -1) {
		onClick(x - 1, y);
	}
	if (x < HEIGHT / SIZE - 1 && TABLE[x + 1][y] != -1) {
		onClick(x + 1, y);
	}
	if (x > 0 && y > 0 && TABLE[x - 1][y - 1] != -1) {
		onClick(x - 1, y - 1);
	}
	if (x < HEIGHT / SIZE - 1 && y > 0 && TABLE[x + 1][y - 1] != -1) {
		onClick(x + 1, y - 1);
	}
	if (x < HEIGHT / SIZE - 1 && y < WIDTH / SIZE - 1 && TABLE[x + 1][y + 1] != -1) {
		onClick(x + 1, y + 1);
	}
	if (y < WIDTH / SIZE - 1 && x > 0 && TABLE[x - 1][y + 1] != -1) {
		onClick(x - 1, y + 1);
	}

}

function printt() {

	for (let i = 0; i < HEIGHT / SIZE; i++) {
		for (let j = 0; j < WIDTH / SIZE; j++) {
			if (TABLE[i][j] == -1)
				$($("td")[i * WIDTH / SIZE + j]).text("💣").css("background-color", "red");
		}
	}

}

function print() {

	for (let i = 0; i < HEIGHT / SIZE; i++) {
		for (let j = 0; j < WIDTH / SIZE; j++) {
			if (CLICKED[i][j] == true)
				if (SHOWING[i][j] == 0);
				else if (TABLE[i][j] == -1) 
					$($("td")[i * WIDTH / SIZE + j]).text("💣").css("background-color", "red");
				else
					$($("td")[i * WIDTH / SIZE + j]).text(SHOWING[i][j]);
		}
	}

}

function copy() {

	for (let i = 0; i < $("td").length; i++) {
		if ($($("td")[i]).css("background-color") == "rgb(184, 184, 184)") {
			let x = parseInt(i / (WIDTH / SIZE));
			let y = i % (WIDTH / SIZE);
			CLICKED[x][y] = true;
			onClick(x, y);
		}
	}

}

function flagMode() {
	FLAG = FLAG ? false : true;
	if (FLAG)
		$("#flag").css("color", "greenyellow"); 
	else
		$("#flag").css("color", "red"); 
}