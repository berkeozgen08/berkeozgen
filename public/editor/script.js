openLoader();

let codeMirror = CodeMirror(document.getElementById("code"), {
	value: value,
	mode:  "null",
	extraKeys: {
		"Alt-Up": "addCursorToPrevLine",
		"Alt-Down": "addCursorToNextLine"
	},
	lineNumbers: true,
	keyMap: "sublime",
	theme: "one-dark",
	indentWithTabs: true,
	indentUnit: 4,
	autoCloseBrackets: true,
	autoCloseTags: true,
	styleActiveLine: true
});

codeMirror.setSize("100%", "100%");

if (window.innerWidth >= 768) {
	codeMirror.setOption("scrollbarStyle", "overlay");
}

const lang = async () => {
	let mime = document.querySelector("select").value;
	let mode = CodeMirror.findModeByMIME(mime).mode;
	if (mode != "null") {
		if (mode.includes("html")) {
			let data = await fetch(`mode/xml/xml.js`);
			let parsed = await data.text();
			eval(parsed);
			let data1 = await fetch(`mode/css/css.js`);
			let parsed1 = await data1.text();
			eval(parsed1);
			let data2 = await fetch(`mode/javascript/javascript.js`);
			let parsed2 = await data2.text();
			eval(parsed2);
		}
		let data = await fetch(`mode/${mode}/${mode}.js`);
		let parsed = await data.text();
		eval(parsed);
	}
	codeMirror.setOption("mode", mime);

	if (document.querySelector("select").selectedOptions[0].innerText == "Java") {
		document.getElementById("openrun").classList.add("active");
	} else {
		document.getElementById("openrun").classList.remove("active");
	}
}

document.querySelector("select").addEventListener("change", lang);

function openLoader() {
	let loader = document.querySelector(".loader-container");
	loader.classList.add("active");
}

function closeLoader() {
	let loader = document.querySelector(".loader-container");
	loader.classList.remove("active");
}

let runcontainer = document.querySelector(".run-container");

window.addEventListener("keydown", e => {
	if (e.ctrlKey && e.key == "F5") {
		e.preventDefault();
		if (document.querySelector("select").selectedOptions[0].innerText == "Java") {
			document.getElementById("input").focus();
			runcontainer.classList.add("active");
			document.querySelector(".container").classList.add("darken");
		} else {
			createNotf(document.querySelector("select").selectedOptions[0].innerText + " is not supported.");
		}
	}
});

document.getElementById("openrun").addEventListener("click", e => {
		e.preventDefault();
		document.getElementById("input").focus();
		runcontainer.classList.add("active");
		document.querySelector(".container").classList.add("darken");
});

async function run(socket) {
	createNotf("Running.");
	if (socket) {
		socket.emit("notf", "Running.");
	}
	let req = await fetch("/editor/run", {
		method: "POST",
		headers: {
			"content-type": "application/json"
		},
		body: JSON.stringify({
			code: codeMirror.getValue(),
			input: document.querySelector("#input").value
		})
	});
	let {output, error} = await req.json();
	let str = "";
	if (output && error) {
		str += output;
		str += error;
	} else if (output) {
		str += output;
	} else {
		str += error;
	}
	createNotf(str.replaceAll("\n", "<br>"), 10000);
	if (socket) {
		socket.emit("run", str);
	}
}

const runListener = (e, socket = null) => {
	run(socket);
	runcontainer.classList.remove("active");
	document.querySelector(".container").classList.remove("darken");
};

document.getElementById("run").addEventListener("click", runListener);

runcontainer.addEventListener("click", e => {
	if (e.target == runcontainer) {
		runcontainer.classList.remove("active");
		document.querySelector(".container").classList.remove("darken");
	}
});

runcontainer.addEventListener("keydown", e => {
	if (e.key == "Escape") {
		runcontainer.classList.remove("active");
		document.querySelector(".container").classList.remove("darken");
	}
});

document.querySelectorAll(".run input").forEach(i => {
	i.addEventListener("keydown", e => {
		if (e.key == "Enter") {
			document.getElementById("run").click();
		}
	});
});