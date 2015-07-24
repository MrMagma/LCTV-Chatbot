/* This project is a spinoff of the LCTV chat bot created by Christy94 which can be found here https://github.com/Cristy94/livecoding-chat-bot */
/*
Issues
Bot messes up with colors
Or not...
*/

var Bot = (function() {
	var container = $('.message-pane');
	var textarea = $('#message-textarea');
	var submit = $('input[type="submit"]');
	var inChat = $(".roster-pane");

	var locationSplit = window.location.toString().split("/");
	var owner = locationSplit[locationSplit.length - 2];

	clearInterval(window.update);

	var body = document.body;

	$('.message', container).addClass('read');



	var commands = {};

	var internal = {
		messageQueue: [],
		names: ["Bob", "Joe", "Mr. Bond"],
		waitingMessage: 0,
		onMessage: []
	};

	var commandUtil = {
		commands: commands,
		owner: window.location,
		inChat: []
	};

	//@Future me: DO NOT UNCOMMENT THIS CODE! IT MAKES THE HELP COMMAND BREAK!
	/*Object.defineProperty(commandUtil, "commands", {
		set: function() {

		}
	});*/

	Object.defineProperty(commandUtil, "owner", {
		set: function() {

		}
	});

	var Bot = {
		name: "Bob the bot",
		welcome: "{{SENDER}}: Welcome to the stream @{{TARGET}}!",
		enableWelcome: true,
		enableHelp: true,
		enableCommands: true
	};
	// Initialize the color pallete
	$('#username-color').trigger('click');
	$('#context-menu').trigger('mouseout');

	var initialColor = $('#colorPremiumInput').val();


	internal.processMessage = function(msg) {
		console.log("Message received! \"" + msg + "\"");

		for (var i = 0; i < internal.onMessage.length; i ++) {
			internal.onMessage[i](msg);
		}
	}

	internal.runCommand = function(cmd, sender) {
		try {
			if (Bot.enableCommands) {
				var data = cmd.split(" ");

				var command = data.shift();
				data.push({
					command: command, //Just in case a command has an identity crisis
					sender: sender || internal.names[Math.floor(Math.random(internal.names.length))]
				});

				if (commands[command] !== undefined && commands[command].enabled) {
					commands[command].callback.apply(commandUtil, data);
				}
			}
		} catch (error) {
			internal.sendMessage(error);
		}
	}

	internal.resetColor = function() {
		if (!internal.waitingMessages) {
			setTimeout(function() {
				if (!internal.waitingMessages) {
					$('.user-color-item').eq(0).attr('data-color', initialColor).trigger('click');
				}
			}, 1000);
		}
	}

	internal.sendMessage = function(msg, cfg) {
		if (!cfg) cfg = {};
		if (!cfg.sender) cfg.sender = Bot.name;
		//TODO(Mr Magma): Make it so that initialColor is updated dynamically (low priority)
		if (!internal.waitingMessages) {
			initialColor = $('#colorPremiumInput').val();
		}

		msg = msg.toString();
		
		$('.user-color-item').eq(0).attr('data-color', '#FFFFFF').trigger('click');
		internal.waitingMessages += 1;
		setTimeout(function() {
			var message = msg;
			for (var i in cfg) {
				var key = "{{" + i.toUpperCase() + "}}";
				message = message.replace(key, cfg[i]);
			}
			console.log(message);
			textarea.val(message);
			submit.trigger("click");
			internal.waitingMessages -= 1;
			internal.resetColor();
		}, 2000);
	}

	internal.getMessages = function() {
		var newMessages = $('.message:not(.read)', container);
		newMessages.each(function() {
			var $this = $(this);
			$this.addClass("read");
			internal.messageQueue.push($this);
		});
	}

	internal.updateInChat = function() {
		commandUtil.inChat = [];
		inChat = $(".roster-pane .user");
		inChat.each(function() {
			var $this = $(this);
			commandUtil.inChat.push($(".label", $this).text());
		})
	}

	internal.update = function() {
		internal.getMessages();
		internal.updateInChat();
		
		while (internal.messageQueue.length > 0 && textarea.val() === "") {
			var message = internal.messageQueue.shift();
			internal.processMessage(message);
		}

		//setTimeout(internal.update, 500);
	}



	commandUtil.sendMessage = function(msg, cfg) {
		internal.sendMessage(msg, cfg);
	}



	Bot.setCommand = function(cmd, callback, help) {
		var funcRegex = /\((.+|)\)(?: |){([^]+)}/;
		/* funcStuff[1] is the functions parameters, funcStuff[2] is the body */
		var funcStuff = callback.toString().match(funcRegex);

		var data = funcStuff[1].split(/(?:, |,)/g);
		data.push("with(this){" + funcStuff[2] + "}");

		commands[cmd] = {
			callback: Function.apply({}, data),
			help: help || "No documentation supplied",
			enabled: true
		};
	}

	Bot.disableCommand = function(cmd) {
		if (commands[cmd] !== undefined) {
			commands[cmd].enabled = false;
		}
	}

	Bot.enableCommand = function(cmd) {
		if (commands[cmd] !== undefined) {
			commands[cmd].enabled = true;
		}
	}

	Bot.runCommand = function(cmd, args) {
		if (commands[cmd] !== undefined) {
			commands[cmd].callback.apply(commandUtil, args);
		}
	}

	Bot.testCommand = function(cmdString) {
		internal.runCommand(cmdString);
	}

	Bot.onMessage = function(callback) {
		internal.onMessage.push(callback.bind(commandUtil));
	}

	Bot.inChat = function(user) {
		if (commandUtil.inChat.indexOf(user) !== -1) return true;
		return false;
	}

	Bot.sendMessage = internal.sendMessage;



	function notify(msg) {
		// Let's check if the browser supports notifications
		if (!("Notification" in window)) {
			return;
		}

		// Let's check whether notification permissions have alredy been granted
		else if (Notification.permission === "granted") {
			// If it's okay let's create a notification
			var notification = new Notification(msg);
		} else if (Notification.permission !== 'denied') {
			Notification.requestPermission(function (permission) {
			// If the user accepts, let's create a notification
				if (permission === "granted") {
					var notification = new Notification(msg);
				}
			});
		}

		// At last, if the user has denied notifications, and you 
		// want to be respectful there is no need to bother them any more.
	}

	Bot.onMessage(function(msg) {
		if (msg.hasClass("message-info")) {
			var text = msg.text();
        
	        // Someone entered the room
	        if (Bot.enableWelcome && text.indexOf(' joined the room.') !== -1) {
	            var username = text.slice(0, text.indexOf(' joined the room.'));
	            notify(username + " has joined the stream!");
	            if (Bot.welcome.constructor === Array) {
	            	var messageIndex = Math.floor(Math.random() * Bot.welcome.length)
					internal.sendMessage(Bot.welcome[messageIndex], {target: username});
	            } else {
	            	internal.sendMessage(Bot.welcome, {target: username});
	        	}
	        }
		}
	});

	Bot.onMessage(function(msg) {
		//TypeError: msg[0].childNodes[1] is undefined
		if (msg.length && msg[0].childNodes && msg[0].childNodes.length) {
			var parsedMsg = {
				sender: msg[0].childNodes[0].textContent,
				body: msg[0].childNodes[1].textContent
			};
			console.log(this.owner);
			if (parsedMsg.body[0] === "/") {
				internal.runCommand(parsedMsg.body.substr(1), parsedMsg.sender);
			} else if(!document.hasFocus()) {
				notify(parsedMsg.sender + ": " + parsedMsg.body);
			}
		}
	});

	Bot.setCommand("help", function(command) {
		if (Bot.enableHelp) {
			var data = arguments[arguments.length - 1];
			var message = "";
			if (command === undefined || commands[command] === undefined) {
				message = "commands are: ";
				for (var i in commands) {
					message += i + ", ";
				}
				message += " (Type /help <command> for a more information about a specific command)";
			} else {
				message = command + ": " + commands[command].help;
			}
			sendMessage("{{SENDER}}: @{{TARGET}} " + message, {target: data.sender});
		}
	}, "Prints documentation for all commands");

	Bot.importExtension = function(url) {
		//TODO(Mr Magma): Extensions don't load, probably some LCTV security thing. See if this can be fixed
		jQuery.getScript(url);
	}



	window.update = setInterval(internal.update, 500);



	return Bot;
})();



Bot.welcome = [
	"{{SENDER}}: Welcome to the stream @{{TARGET}}!",
	"{{SENDER}}: Hi @{{TARGET}}! Thanks for tuning in!",
	"{{SENDER}}: Hello @{{TARGET}}!"
];



Bot.setCommand("shrug", function() {
	var data = arguments[arguments.length - 1];
	sendMessage("@{{TARGET}} says: ¯\\_(ツ)_/¯", {target: data.sender})
}, "¯\\_(ツ)_/¯");



Bot.setCommand("add", function(a, b) {
	var data = arguments[arguments.length - 1];
	sendMessage("{{SENDER}}: @{{TARGET}} " + a + " plus " + b + " equals " + (parseFloat(a) + parseFloat(b)), {target: data.sender});
}, "Adds two numbers. Usage /add number1 number2");

Bot.setCommand("subtract", function(a, b) {
	var data = arguments[arguments.length - 1];
	sendMessage("{{SENDER}}: @{{TARGET}} " + a + " minus " + b + " equals " + (parseFloat(a) - parseFloat(b)), {target: data.sender});
}, "Subtracts one number from another. Usage /subtract number1 number2");

Bot.setCommand("multiply", function(a, b) {
	var data = arguments[arguments.length - 1];
	sendMessage("{{SENDER}}: @{{TARGET}} " + a + " times " + b + " equals " + (parseFloat(a) * parseFloat(b)), {target: data.sender});
}, "Find the product of two numbers. Usage /multiply number1 number2");

Bot.setCommand("divide", function(a, b) {
	var data = arguments[arguments.length - 1];
	sendMessage("{{SENDER}}: @{{TARGET}} " + a + " over " + b + " equals " + (parseFloat(a) / parseFloat(b)), {target: data.sender});
}, "Divides one number by another. Usage /divide number1 number2");

Bot.setCommand("power", function(a, b) {
	var data = arguments[arguments.length - 1];
	sendMessage("{{SENDER}}: @{{TARGET}} " + a + " to the " + b + " equals " + Math.pow(parseFloat(a), parseFloat(b)), {target: data.sender});
}, "Outputs a number raised to a power. Usage /power number power");

Bot.setCommand("root", function(a, b) {
	var data = arguments[arguments.length - 1];
	var a = parseFloat(a);
	var b = parseFloat(b);
	var root = Math.pow(Math.E, Math.log(b) / a);
	sendMessage("{{SENDER}}: @{{TARGET}} the " + a + " root of " + b + " equals " + root, {target: data.sender});
}, "Gets the n root of a number. Usage /root number n");

Bot.setCommand("log", function(a, b) {
	var data = arguments[arguments.length - 1];
	var a = parseFloat(a);
	var b = parseFloat(b || "10");
	sendMessage("{{SENDER}}: @{{TARGET}} the base " + b + " log of " + a + " equals " + (Math.log(a) / Math.log(b)), {target: data.sender});
}, "Gets the logarithm of a number. Usage /log number base");



Bot.setCommand("roster", function() {
	var data = arguments[arguments.length - 1];
	sendMessage("@{{TARGET}} There are " + inChat.length + " people in chat right now", {target: data.sender});
}, "Gets the number of people in the chatroom currently. Usage /roster");

Bot.setCommand("who", function() {
	var data = arguments[arguments.length - 1];
	var message = "@{{TARGET}}: Users in chat are ";
	for (var i = 0; i < inChat.length; i ++) {
		var userAppend = "";
		if (i === inChat.length - 1) {
			userAppend += "and "
		}
		userAppend += inChat[i];
		if (i < inChat.length - 1) {
			userAppend += ", "
		}
		message += userAppend;
	}
	sendMessage(message, {target: data.sender});
}, "Gets a list of the usernames of people currently in chat. Usage /who");






var tttGames = {};

var TicTacToe = function(cfg) {
	if (!(this instanceof TicTacToe)) return new TicTacToe(cfg);
	//this.id = cfg.id;
	this.players = {
		"X": cfg.player1,
		"O": cfg.player2
	};
	this.board = [
		["", "", ""],
		["", "", ""],
		["", "", ""]
	];
}

TicTacToe.prototype = {
	tryMove: function(player, x, y) {
		if (x > 0 && y > 0 && x < this.board.length && y < this.board.length && this.board[x][y] === "" && player in this.players) {
			this.board[x][y] = player;
			this.checkEnd();
		}
	},
	checkEnd: function() {

	}
};



var challenges = {};
/*
{
	userName: {
		challenger: {
			game: game,
			from: userName
		}
	}
}
*/

/*Bot.setCommand("game", function(game, opponent) {
	var data = arguments[arguments.length - 1];
	if (data === opponent || data === game) {
		return;
	}
	/* TODO(Mr Magma): Make this better eventually when there are more games with an object of games 
	if (game === "TTT") {
		challenges[opponent] = {
			game: game,
			challenger: opponent
		};
	}
});*/

function sendChallenge(challengee, game, data) {
	if (Bot.inChat(challengee)) {
		if (challenges[challengee] !== undefined && !(data.sender in challenges[challengee])) {
			challenges[challengee][data.sender] = {
				from: data.sender,
				game: "TTT"
			}
		} else if (challenges[challengee] === undefined) {
			challenges[challengee] = {};
			challenges[challengee][data.sender] = {
				from: data.sender,
				game: "TTT"
			}
		} else {
			Bot.sendMessage("@{{PLAYER1}} you have already sent a challenge to @{{PLAYER2}}! Please wait for them to respond!", {
				player1: data.sender,
				player2: challengee
			})
			return;
		}
		Bot.sendMessage("@{{PLAYER1}} has challenged @{{PLAYER2}} to a game of Tic Tac Toe! ", {
			player1: data.sender,
			player2: challengee
		});
	} else {
		Bot.sendMessage("@{{PLAYER1}}: {{PLAYER2}} is not in the chat right now", {
			player1: data.sender,
			player2: challengee
		});
	}
}

function declineChallenge(challenger, data) {
	if (challenges[data.sender] !== undefined) {
		delete challenges[data.sender][challenger];
		Bot.sendMessage("@{{PLAYER1}} has declined @{{PLAYER2}}'s challenge!", {
			player1: data.sender,
			player2: challenger
		})
	}
}

function acceptChallenge(challenger, data) {
	var challengee = challenges[data.sender];
	if (challengee[challenger] !== undefined) {
		var challenge = challengee[challenger].game;
		if (challenge === "ttt") {
			tttGames[challenger] = new TicTacToe({
				player1: challenger,
				player2: data.sender
			});
			delete challengee[challenger];
			Bot.sendMessage("@{{PLAYER1}} has accepted @{{PLAYER2}}'s challenge to a game of Tic Tac Toe!", {
				player1: challenger,
				player2: data.sender
			})
		}
	}
}

function listChallenges(data) {
	//Tell the user all challenges that have been sent to them
	if (challenges[data.sender] === undefined) {
		sendMessage("@{{TARGET}}: You do not have any challenges currently.", {
			target: data.sender
		})
	} else {
		var userChallenges = challenges[data.sender];
		var challengers = [];
		for (var i in userChallenges) {
			challengers.push(i);
		}
		if (!challengers.length) {
			sendMessage("@{{TARGET}}: You have challenges from " + challengers.join(", "), {
				target: data.sender
			})
		} else {
			sendMessage("@{{TARGET}}: You do not have any challenges currently.", {
				target: data.sender
			})
		}
	}
}

Bot.setCommand("challenge", function() {
	var data = arguments[arguments.length - 1];
	if (arguments.length === 1) {
		listChallenges(data.sender);
	} else if (arguments.length === 3) {
		if (arguments[0] === "accept" && challenges[data.sender] !== undefined) {
			acceptChallenge(arguments[1], data);
		} else if (arguments[0] === "decline") {
			declineChallenge(arguments[1], data);
		} else {
			sendChallenge(arguments[0], arguments[1], data);
		}
	}
}, "Used to challenge other people to games, check your challenges, and accept and decline challenges. Usage /challenge to get your challenges, /challenge user game to challenge someone to a game, and /challenge <accept|decline> user to accept or decline challenges");

Bot.setCommand("game", function() {
	var data = arguments[arguments.length - 1];
});

