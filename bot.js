/* This project is a spinoff of the LCTV chat bot created by Christy94 which can be found here https://github.com/Cristy94/livecoding-chat-bot */
/*
Issues
Bot messes up with colors
Or not...
*/

var Bot = (function() {
	/* Self executing function so we can have pseudo namespacing */
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
		owner: /\w+(?=\/(?!\w))/ig.exec(window.location)[1] || "",
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
		/* This method processes messages once they are recieved and passes them to the onMessage event listeners*/

		for (var i = 0; i < internal.onMessage.length; i ++) {
			internal.onMessage[i].call(commandUtil, msg);
		}
	}

	internal.runCommand = function(cmd, sender) {
		/* This method checks to see if a command exists, and if so runs that command */
		//Sometimes commands may have errors and the LCTV console is kind of full already so we catch said
		//errors and send them as a message (very unobtrusive, I know)
		try {
			//Only run commands if they're enabled
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
		/* This method resets the color to it's original after the bot is done sending it's message */
		if (!internal.waitingMessages) {
			setTimeout(function() {
				if (!internal.waitingMessages) {
					$('.user-color-item').eq(0).attr('data-color', initialColor).trigger('click');
				}
			}, 1000);
		}
	}

	internal.sendMessage = function(msg, cfg) {
		/* This method turns sends a message after 2 seconds */
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
		/* Finds all messages that we have not yet processed */
		var newMessages = $('.message:not(.read)', container);
		newMessages.each(function() {
			var $this = $(this);
			$this.addClass("read");
			internal.messageQueue.push($this);
		});
	}

	internal.updateInChat = function() {
		/* Updates the list of people who are currently in chat */
		commandUtil.inChat = [];
		inChat = $(".roster-pane .user");
		inChat.each(function() {
			var $this = $(this);
			commandUtil.inChat.push($(".label", $this).text());
		})
	}

	internal.update = function() {
		/* Calls all of our updatey methods and processes unread messages */
		internal.getMessages();
		internal.updateInChat();
		
		while (internal.messageQueue.length > 0 && textarea.val() === "") {
			var message = internal.messageQueue.shift();
			internal.processMessage(message);
		}

		//setTimeout(internal.update, 500);
	}



	commandUtil.sendMessage = function(msg, cfg) {
		/* Basically a copy of internal.sendMessage for use withing commands without the "." 
		   Wrapped so nobody messed with the internal version */
		internal.sendMessage(msg, cfg);
	}



	Bot.setCommand = function(cmd, callback, help) {
		/* Sets a new command (cmd) to execute task (callback) with the help string of (help) */
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
		/* Make it so that a command cannot be used */
		if (commands[cmd] !== undefined) {
			commands[cmd].enabled = false;
		}
	}

	Bot.enableCommand = function(cmd) {
		/* Undo the effects of Bot.disableCommand */
		if (commands[cmd] !== undefined) {
			commands[cmd].enabled = true;
		}
	}

	Bot.runCommand = function(cmd, args) {
		/* Debugging/command utility method to run a command without it being sent */
		if (commands[cmd] !== undefined) {
			commands[cmd].callback.apply(commandUtil, args);
		}
	}

	Bot.testCommand = function(cmdString) {
		/* Debugging method to test parsing a string into a command call */
		internal.runCommand(cmdString);
	}

	Bot.onMessage = function(callback) {
		/* Adds a function to be called when a message is received */
		internal.onMessage.push(callback.bind(commandUtil));
	}

	Bot.inChat = function(user) {
		/* Utility method to check if a specific user is currently in chat */
		if (commandUtil.inChat.indexOf(user) !== -1) return true;
		return false;
	}

	Bot.sendMessage = internal.sendMessage;



	function notify(head, msg) {
		/* Method for desktop notifications (totally not straight off MDN) */
		if (!msg.length) msg = "";
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
					var notification = new Notification(head, {
						body: msg
					});
				}
			});
		}

		// At last, if the user has denied notifications, and you 
		// want to be respectful there is no need to bother them any more.
	}

	//When someone joins the stream
	Bot.onMessage(function(msg) {
		if (msg.hasClass("message-info")) {
			var text = msg.text();
        
	        // Someone entered the room
	        if (Bot.enableWelcome && text.indexOf(' joined the room.') !== -1) {
	            var username = text.slice(0, text.indexOf(' joined the room.'));
	            notify("New viewer!", username + " has joined the stream!");
	            if (Bot.welcome.constructor === Array) {
	            	var messageIndex = Math.floor(Math.random() * Bot.welcome.length)
					internal.sendMessage(Bot.welcome[messageIndex], {target: username});
	            } else {
	            	internal.sendMessage(Bot.welcome, {target: username});
	        	}
	        }
		}
	});

	//When a command or normal message has been sent
	Bot.onMessage(function(msg) {
		//TypeError: msg[0].childNodes[1] is undefined
		if (msg.length && msg[0].childNodes && msg[0].childNodes.length) {
			var parsedMsg = {
				sender: msg[0].childNodes[0].textContent,
				body: msg[0].childNodes[1].textContent
			};
			if (parsedMsg.body[0] === "/") {
				internal.runCommand(parsedMsg.body.substr(1), parsedMsg.sender);
			} else if(!document.hasFocus() /*&& parsedMsg.sender.toLowerCase() !== this.owner.toLowerCase()*/) {
				notify("New message from " + parsedMsg.sender, parsedMsg.body);
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
	$(Candy).on('candy:view.message.before-show', function(evt, args) {
		for (var i in evt) {
			console.log("evt: " + i);
		}
		for (var i in args) {
			console.log("args: " + i);
		}
	});


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
	/*
	cfg is {
		player1: string,
		player2: string
	}
	*/
	if (!(this instanceof TicTacToe)) return new TicTacToe(cfg);

	this.player1 = cfg.player1;
	this.player2 = cfg.player2;

	this.playerIndex = {};
	this.playerIndex[cfg.player1] = "X";
	this.playerIndex[cfg.player2] = "O";

	this.players = {
		X: {
			name: cfg.player1,
			moves: []
		},
		O: {
			name: cfg.player2,
			moves: []
		}
	}

	this.board = [
		["N", "N", "N"],
		["N", "N", "N"],
		["N", "N", "N"]
	];
	this.wins = [
		[1, 4, 7],
		[2, 5, 8],
		[3, 6, 9],
		[1, 2, 3],
		[4, 5, 6],
		[7, 8, 9],
		[1, 5, 9],
		[3, 5, 7]
	];

	this.turns = ["X", null, "O"]
	this.turn = -1;

	this.winner = "N";
	/*
	[1, 2, 3]
	[4, 5, 6]
	[7, 8, 9]
	X+Y*3+1
	*/
}

TicTacToe.prototype = {
	tryMove: function(player, x, y) {
		/*
		player is string
		x should be number but check before using
		y should be number but check before using
		*/
		var playerName = player;
		player = this.playerIndex[player];
		if (player !== this.turns[1 + this.turn]) {
			Bot.sendMessage("@{{TARGET}}: It's not your turn yet!", {
				target: this.players[player].name
			})
			return;
		}
		if (x.constructor !== Number || y.constructor !== Number) return;
		if (x >= 0 && y >= 0 && x < this.board.length && y < this.board[x].length) {
			if (this.board[x][y] !== "N") {
				Bot.sendMessage("@{{PLAYER}}: Please pick a valid move.", {
					player: playerName
				});
				return;
			}
			//this.players[this.turns[(1 + this.turn)]]
			this.board[x][y] = player;
			this.players[player].moves.push(x + y * 3 + 1);
			var playerWon = this.checkWin(player);
			this.turn = -this.turn;
			if (playerWon) {
				Bot.sendMessage("@{{WINNER}} has won the game of Tic Tac Toe as {{SIDE}} against @{{LOSER}}!", {
					winner: this.players[player].name,
					loser: this.players[this.turns[1 + this.turn]].name,
					side: player
				})
				this.winner = player;
			} else {
				Bot.sendMessage("@{{TARGET}}: @{{MOVER}} has moved! It's your turn now!", {
					target: this.players[this.turns[1 + this.turn]].name,
					mover: this.players[player].name
				})
			}
		}
	},
	checkWin: function(side) {
		/*
		internal method
		side is either "X" or "O"
		used to check if the specified side has won the game
		*/
		if (this.players[side] !== undefined) {
			if (this.players[side].moves.length < 3) {
				return false;
			}

			var moves = this.players[side].moves;
			for (var i = 0; i < this.wins.length; i ++) {
				var win = this.wins[i];
				for (var n = 0; n < win.length; n ++) {
					if (moves.indexOf(win[n]) === -1) {
						break;
					}
					if (n === win.length - 1) {
						return true;
					}
				}
			}
		}
	},
	sendBoard: function() {
		var board = this.board;
		var message = "@{{PLAYER1}} VS @{{PLAYER2}} in Tic Tac Toe";
		for (var x = 0; x < board.length; x ++) {
			message += " \n"
			for (var y = 0; y < board[x].length; y ++) {
				message += board[x][y];
				if (y < board[x].length - 1) {
					message += " | "
				}
			}
			message += " \n"
			if (x < board.length - 1) {
				message += "---+---+---";
			}
		}
		Bot.sendMessage(message, {
			player1: this.player1,
			player2: this.player2
		})
	}
};



var challenges = {};

function sendChallenge(challengee, game, data) {
	/* TODO(MrMagma): Clean up this absolutely ugly method */
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
		Bot.sendMessage("@{{PLAYER1}} has challenged @{{PLAYER2}} to a game of Tic Tac Toe!", {
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
	if (!Bot.inChat(challenger)) {
		Bot.sendMessage("@{{SENDER}}: That challenger has left the chat!", {
			sender: data.sender
		});
		delete challenges[data.sender][challenger];
		return;
	}
	if (tttGames[data.sender] !== undefined) {
		sendMessage("@{{SENDER}}: You are not allowed to accept challenges while you are playing a game. Please finish the game first, and then accept @{{CHALLENGER}}'s challenge.", {
			sender: data.sender,
			challenger: challenger
		})
	}
	if (challengee[challenger] !== undefined) {
		var challenge = challengee[challenger].game;
		if (challenge === "TTT") {
			var game = new TicTacToe({
				player1: challenger,
				player2: data.sender
			});
			tttGames[challenger] = game;
			tttGames[data.sender] = game;
			delete challengee[challenger];
			Bot.sendMessage("@{{PLAYER2}} has accepted @{{PLAYER1}}'s challenge to a game of Tic Tac Toe!", {
				player1: challenger,
				player2: data.sender
			})
		}
	}
}

function listChallenges(data) {
	//Tell the user all challenges that have been sent to them
	if (challenges[data.sender] === undefined) {
		Bot.sendMessage("@{{TARGET}}: You do not have any challenges currently.", {
			target: data.sender
		})
	} else {
		var userChallenges = challenges[data.sender];
		var challengers = [];
		for (var i in userChallenges) {
			challengers.push(i);
		}
		if (!challengers.length) {
			Bot.sendMessage("@{{TARGET}}: You do not have any challenges currently.", {
				target: data.sender
			})
		} else {
			Bot.sendMessage("@{{TARGET}}: You have challenges from " + challengers.join(", "), {
				target: data.sender
			})
		}
	}
}

Bot.setCommand("challenge", function() {
	var data = arguments[arguments.length - 1];

	if (arguments.length === 1) {
		listChallenges(data);
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
	/*
	move x y
	view
	resign
	*/
	var data = arguments[arguments.length - 1];

	if (!tttGames[data.sender]) return;
	
	var game = tttGames[data.sender];
	
	if (arguments.length > 2 && arguments[0] === "move") {
		var x = parseFloat(arguments[1]);
		var y = parseFloat(arguments[2]);
		console.log("X:" + x + ", Y:" + y);
		game.tryMove(data.sender, x, y);
		if (game.winner !== "N") {
			var player1 = game.player1;
			var player2 = game.player2;
			delete tttGames[player1];
			delete tttGames[player2];
		}
		game.sendBoard();
	} else if (arguments[0] === "view") {
		game.sendBoard();
	} else if (arguments[0] === "resign") {
		var player1 = game.player1;
		var player2 = game.player2;
		sendMessage("@{{SENDER}} has resigned! @{{WINNER}} has won the game!", {
			sender: data.sender,
			winner: (data.sender === player1) ? player2 : player1
		});
		game.sendBoard();
		delete tttGames[player1];
		delete tttGames[player2];
	}
}, "Used to control the current game. Usage /game view, /game move x y, /game resign");



Bot.setCommand("time", function() {

	sendMessage("The time is {{TIME}} {{TIMEZONE}}", {
		time: (new Date).getUTCHours() + ":" + (new Date).getMinutes(),
		timeZone: "UTC"
	});
}, "Gets the current UTC time. Usage /time")

