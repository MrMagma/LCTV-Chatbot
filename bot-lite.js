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
		owner: /\w+(?=\/(?!\w))/ig.exec(window.location)[1] || "",
		inChat: []
	};

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

	$('#username-color').trigger('click');
	$('#context-menu').trigger('mouseout');

	var initialColor = $('#colorPremiumInput').val();
	
	internal.processMessage = function(msg) {
		for (var i = 0; i < internal.onMessage.length; i ++) {
			internal.onMessage[i].call(commandUtil, msg);
		}
	}

	internal.runCommand = function(cmd, sender) {
		try {
			if (Bot.enableCommands) {
				var data = cmd.split(" ");

				var command = data.shift();
				data.push({
					command: command,
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
	}

	commandUtil.sendMessage = function(msg, cfg) {
		internal.sendMessage(msg, cfg);
	}

	Bot.setCommand = function(cmd, callback, help) {
		var funcRegex = /\((.+|)\)(?: |){([^]+)}/;
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

	function notify(head, msg) {
		if (!msg.length) msg = "";
		if (!("Notification" in window)) {
			return;
		}

		else if (Notification.permission === "granted") {
			var notification = new Notification(msg);
		} else if (Notification.permission !== 'denied') {
			Notification.requestPermission(function (permission) {
				if (permission === "granted") {
					var notification = new Notification(head, {
						body: msg
					});
				}
			});
		}
	}

	Bot.onMessage(function(msg) {
		if (msg.hasClass("message-info")) {
			var text = msg.text();
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

	Bot.onMessage(function(msg) {
		if (msg.length && msg[0].childNodes && msg[0].childNodes.length) {
			var parsedMsg = {
				sender: msg[0].childNodes[0].textContent,
				body: msg[0].childNodes[1].textContent
			};
			if (parsedMsg.body[0] === "/") {
				internal.runCommand(parsedMsg.body.substr(1), parsedMsg.sender);
			} else if(!document.hasFocus()) {
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

