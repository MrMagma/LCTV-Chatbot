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
		owner: $('.chat-heading div').text().replace('Chat: ', ''),
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
					internal.sendMessage(Bot.welcome[welcomeIndex], {target: username});
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
			} else if(parsedMsg.body.indexOf("@" + this.owner) !== -1) {
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
	sendMessage("There are " + inChat.length + " people in chat right now");
}, "Gets the number of people in the chatroom currently. Usage /roster");

Bot.setCommand("who", function() {
	var data = arguments[arguments.length - 1];
	var message = "@{{TARGET}}: Users in chat are, ";
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




