"use strict";

(function () {
	const OK_HTTP_STATUS = 200;
	const MULTCHOICES_HTTP_STATUS = 300;
	const NOT_FOUND_HTTP_STATUS = 410;
	const FILE_GONE_HTTP_STATUS = 404;
	const NO_CHANGE = 304;
	const URL = "https://cmessage337.herokuapp.com/messages";
	const TYPING_RATE = 3000;

	let username = "";
	window.onload = function () {
		getMessages();
		document.getElementById("send").onclick = sendMessage;
		document.getElementById("comment").oninput = postTyping;
		setInterval(getTypers, TYPING_RATE);
	};

    /**
     * Gets the typing users and injects them in the HTML after messages.
     */
	function getTypers() {
		let name = document.getElementById("username").value;

		fetch(URL + "/typing")
			.then(checkStatus)
			.then(function (response) {
				clearError();
				let json = JSON.parse(response);
				console.log(json.typing);
				getMessages();
				let typingDiv = document.getElementById("typingDiv");
				if (typingDiv) {
					typingDiv.innerHTML = "";
					let newHr = document.createElement("hr");
					typingDiv.appendChild(newHr);
				} else {
					typingDiv = document.createElement("div");
					typingDiv.id = "typingDiv";
					document.getElementById("messages").appendChild(typingDiv);
				}

				for (let key in json.typing) {
					let label = document.createElement("div");
					label.innerHTML = key + " is typing ...";
					label.className = "typing";
					typingDiv.appendChild(label);
				}
			})
			.catch(postError);
	}

    /**
     * Posts the latest typers in the DB as long as they have usernames.
     */
	function postTyping() {
		let name = document.getElementById("username").value;
		if (!(name === "" || name == null || name === undefined)) {
			const message = { 'username': name };
			let fetchOptions = {
				'method': 'POST',
				'headers': {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				'body': JSON.stringify(message)
			};
			fetch(URL + "/typing", fetchOptions)
				.then(checkStatus)
				.then(function () {
					clearError();
				})
				.catch(postError);
		} else {
			postError(new Error("InputError: Username must be defined."));
		}
	}

    /**
     * Gets messages from DB and injects them to the page
     */
	function getMessages() {
		fetch(URL + "/recent")
			.then(checkStatus)
			.then(function (response) {
				let json = JSON.parse(response);
				if (json.success) {
					clearError();
					let messages = document.getElementById("messages");
					clearChildren(messages);
					for (let i = 0; i < json.messageData.length; i++) {
						let newMessage = document.createElement("div");

						//Check to see if the user is the one who sent it
						if (json.messageData[i].username === username) {
							newMessage.className = "user";
						} else {
							newMessage.className = "other";
						}
						let label = document.createElement("label");
						label.innerHTML = json.messageData[i].username;
						newMessage.appendChild(label);
						newMessage.appendChild(document.createElement("br"));
						newMessage.innerHTML += json.messageData[i].message;
						messages.append(newMessage);
					}
				}
			})
			.catch(postError);
	}

    /**
     * Posts a message to the database.
     */
	function sendMessage() {
		let name = document.getElementById("username").value;
		let comment = document.getElementById("comment").value;
		if (!(name === "" || name == null || name === undefined) &&
			!(comment === "" || comment == null || comment === undefined)) {
			const message = { 'username': name, 'message': comment };
			let fetchOptions = {
				'method': 'POST',
				'headers': {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				'body': JSON.stringify(message)
			};
			fetch(URL, fetchOptions)
				.then(checkStatus)
				.then(function () {
					clearError();
					username = name;
				})
				.catch(postError);
		} else {
			postError(new Error("InputError: Username must be defined and message must be defined."));
		}
	}

    /**
     * This function checks for any common errors that may have occured in fetching data
     * and returns the response text if there are none.
     * @param {Response} response
     */
	function checkStatus(response) {
		if ((response.status >= OK_HTTP_STATUS && response.status < MULTCHOICES_HTTP_STATUS) || response.status === NO_CHANGE) {
			return response.text();
		} else if (response.status === NOT_FOUND_HTTP_STATUS) {
			return Promise.reject(new Error(response.status + ": Message not found in the database"));
		} else if (response.status === FILE_GONE_HTTP_STATUS) {
			return Promise.reject(new Error(response.status + ": File not found"));
		} else {
			return Promise.reject(new Error(response.status + ": " + response.message));
		}
	}

    /**
     * Posts an error with details.
     */
	function postError(error) {
		let errorBanner = document.getElementById("status");
		errorBanner.classList.add("error");
		errorBanner.innerHTML = error.message;
	}

    /**
     * Clears the error banner when things go right.
     */
	function clearError() {
		let errorBanner = document.getElementById("status");
		errorBanner.classList.remove("error");
		errorBanner.innerHTML = "";
	}

    /**
     * Clears all child nodes of a parent node.
     */
	function clearChildren(node) {
		while (node.firstChild) {
			node.removeChild(node.firstChild);
		}
	}
})();