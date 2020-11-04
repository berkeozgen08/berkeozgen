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
}

document.querySelector("select").addEventListener("change", e => {
	lang();
});