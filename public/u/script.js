let urlRegEx = /^(https?:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i;
let slugRegEx = /^[\w\-]+$/i;

document.addEventListener("DOMContentLoaded", (event) => { 
	let inputs = document.querySelectorAll("input");
	inputs[0].focus();
	for (let i of inputs) {
		i.addEventListener("keypress", event => {
			if ((event.which && event.which == 13) || (event.keyCode && event.keyCode == 13)) {
				create();
			}
		});
	}
});

async function create() {
	let url = document.getElementById("url").value;
	let slug = document.getElementById("ending").value;
	if (url === "") return;
	if (!url.match(urlRegEx)) {
		showResult({
			message: "URL is not valid.",
			error: true
		});
		return;
	}
	showResult({
		message: "Getting URL...",
		error: false
	});
	let body = {
		url
	};
	if (slug !== "") {
		if (!slug.match(slugRegEx)) {
			showResult({
				message: "Only lowercase letters, numbers, dashes and underscores.",
				error: true
			});
			return;
		}
		body.slug = slug;
	}
	let res = await fetch("", {
		method: "POST",
		headers: {
			"content-type": "application/json"
		},
		body: JSON.stringify(body)
	});
	let { message } = await res.json();
	showResult({
		message,
		error: res.status === 500 || res.status === 429
	});
}

function showResult(result) {
	let { message, error } = result;
	if (!document.getElementById("result")) {
		let input = document.createElement("input");
		input.setAttribute("id", "result");
		input.toggleAttribute("readonly");
		document.getElementsByClassName("container")[0].appendChild(input);
	}
	let input = document.getElementById("result");
	input.value = message;
	document.getElementById("create").style.marginBottom = "24px";
	if (!error) {
		input.addEventListener("click", copyToClipboard);
	} else {
		input.removeEventListener("click", copyToClipboard);
	}
}

function copyToClipboard(event) {
	let input = document.getElementById("result");;
	event.preventDefault();
	input.select();
	input.setSelectionRange(0, 99999);
	document.execCommand("copy");
	alert("Copied");
}