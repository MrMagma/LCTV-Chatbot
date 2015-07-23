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
	var myUser = $('.chat-heading div').text().replace('Chat: ', '');

	$('.message', container).addClass('read');



	var commands = {};

	var internal = {
		messageQueue: [],
		names: ["Bob", "Joe", "Mr. Bond"],
		waitingMessage: 0,
		onMessage: []
	};

	var commandUtil = {
		commands: commands
	};

	Object.defineProperty(commandUtil, commands, {
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
		if (bot.enableCommands) {
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
			initialColor = $('#colorPremiumInput').val()
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

	internal.update = function() {
		internal.getMessages();

		while (internal.messageQueue.length > 0 && textarea.val() === "") {
			var message = internal.messageQueue.shift();
			internal.processMessage(message);
		}

		setTimeout(internal.update, 200);
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
		console.log(data);

		commands[cmd] = {
			callback: Function.apply({}, data).bind(commandUtil),
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



	Bot.onMessage(function(msg) {
		if (msg.hasClass("message-info")) {
			var text = msg.text();
        
	        // Someone entered the room
	        if (Bot.enableWelcome && text.indexOf(' joined the room.') !== -1) {
	            var username = text.slice(0, text.indexOf(' joined the room.'));
	            if (bot.welcome.constructor === Array) {
	            	var messageIndex = Math.floor(Math.random() * Bot.welcome.length)
					internal.sendMessage(Bot.welcome[welcomeIndex], {target: username});
	            } else {
	            	internal.sendMessage(Bot.welcome, {target: username});
	        	}
	        }
		}
	});

	Bot.onMessage(function(msg) {
		if (msg.length) {
			var parsedMsg = {
				sender: msg[0].childNodes[0].textContent,
				body: msg[0].childNodes[1].textContent
			};

			if (parsedMsg.body[0] === "/") {
				internal.runCommand(parsedMsg.body.substr(1), parsedMsg.sender);
			} else {
				//Possibly notify the user in some unobtrusive way that there's a new message
			}
		}
	});

	Bot.setCommand("help", function(command) {
		if (Bot.enableHelp) {
			var data = arguments[arguments.length - 1];
			var message = "List of commands (Type /help <command> for a more information about a specific command): ";
			if (command === undefined || commands[command] === undefined) {
				for (var i in commands) {
					message += i + ", ";
				}
			} else {
				message = command + ": " + commands[command].help;
			}
			sendMessage("{{SENDER}}: @{{TARGET}} " + message, {target: data.sender});
		}
	}, "Prints documentation for all commands");



	setTimeout(internal.update, 1);



	return Bot;
})();