/* This project is a spinoff of the LCTV chat bot created by Christy94 which can be found here https://github.com/Cristy94/livecoding-chat-bot */
/*
Note to self: A user changing the color of their name triggers a join event
*/

var Bot = (function() {
	/* Self executing function so we can have pseudo namespacing */



	var commands = {};

	var internal = {
		messageQueue: [],
		names: ["Joe", "Mr. Bond"],
		waitingMessage: 0,
		onMessage: []
	};

	var chatOwner = /\/([a-z0-9]+)(?:\/$|$|\?)/ig.exec(window.location)[1].toLowerCase();

	var commandUtil = {
		commands: commands,
		chatOwner: chatOwner,
		room: chatOwner + "@chat.livecoding.tv",
		owner: Candy.Core.getRoom(chatOwner + "@chat.livecoding.tv").user.data.nick,
		roster: []
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
		name: "Bob the Bot",
		welcome: [
			"{{SENDER}}: Welcome to the stream @{{TARGET}}!",
			"{{SENDER}}: Hi @{{TARGET}}! Thanks for tuning in!",
			"{{SENDER}}: Hello @{{TARGET}}! Welcome to the stream!"
		],
		enableWelcome: true,
		enableHelp: true,
		enableCommands: true
	};


	internal.processMessage = function(sender, msg) {
		/* This method processes messages once they are recieved and passes them to the onMessage event listeners*/

		for (var i = 0; i < internal.onMessage.length; i ++) {
			internal.onMessage[i].call(commandUtil, sender, msg);
		}
	};

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
	};

	internal.sendMessage = function(msg, cfg) {
		/* This method turns sends a message after 2 seconds */
		if (!cfg) cfg = {};
		if (!cfg.sender) cfg.sender = Bot.name;

		msg = msg.toString();

		var message = msg;
		for (var i in cfg) {
      if (cfg.hasOwnProperty(i)) {
				var key = "{{" + i.toUpperCase() + "}}";
				message = message.replace(key, cfg[i]);
      }
		}

		Candy.Core.Action.Jabber.Room.Message(commandUtil.room, message);
	};

	internal.updateRoster = function() {
		/* Updates the list of people who are currently in chat */
		commandUtil.roster = [];
		var viewers = Candy.Core.getRoom(chatOwner + "@chat.livecoding.tv").roster.items;
		for (var i in viewers) {
			if (viewers.hasOwnProperty(i)) {
				var user = viewers[i].data.nick;
				commandUtil.roster.push(user);
			}
		}
	};



	commandUtil.sendMessage = function(msg, cfg) {
		/* Basically a copy of internal.sendMessage for use withing commands without the "." 
		   Wrapped so nobody messed with the internal version */
		internal.sendMessage(msg, cfg);
	};

	commandUtil.inChat = function(user) {
		/* Utility method to check if a specific user is currently in chat */
		if (commandUtil.roster.indexOf(user) !== -1) return true;
		return false;
	};



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
	};

	Bot.disableCommand = function(cmd) {
		/* Make it so that a command cannot be used */
		if (commands[cmd] !== undefined) {
			commands[cmd].enabled = false;
		}
	};

	Bot.enableCommand = function(cmd) {
		/* Undo the effects of Bot.disableCommand */
		if (commands[cmd] !== undefined) {
			commands[cmd].enabled = true;
		}
	};

	Bot.runCommand = function(cmd, args) {
		/* Debugging/command utility method to run a command without it being sent */
		if (commands[cmd] !== undefined) {
			commands[cmd].callback.apply(commandUtil, args);
		}
	};

	Bot.testCommand = function(cmdString) {
		/* Debugging method to test parsing a string into a command call */
		internal.runCommand(cmdString);
	};

	Bot.onMessage = function(callback) {
		/* Adds a function to be called when a message is received */
		internal.onMessage.push(callback.bind(commandUtil));
	};

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
			var notification = new Notification(head, {
				body: msg
			});
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

	//When a command or normal message has been sent
	Bot.onMessage(function(sender, msg) {
		if (msg[0] === "/") {
			internal.runCommand(msg.substr(1), sender);
		} else if(!document.hasFocus()/* && sender.toLowerCase() !== this.owner.toLowerCase()*/) {
			notify("New message from " + sender, msg);
		}
	});

	//The help command. Needs to be within the closure because it's something you should always have (can be disabled though, if you insist)
	Bot.setCommand("help", function(command) {
		if (Bot.enableHelp) {
			var data = arguments[arguments.length - 1];
			var message = "";
			if (command === undefined || commands[command] === undefined) {
				message = "commands are: ";
				for (var i in commands) {
          if (commands.hasOwnProperty(i)) {
						message += i + ", ";
          }
				}
				message += " (Type /help <command> for a more information about a specific command)";
			} else {
				message = command + ": " + commands[command].help;
			}
			sendMessage("[{{SENDER}}]: @{{TARGET}} " + message, {target: data.sender});
		}
	}, "Prints documentation for all commands");

	Bot.importExtension = function(url) {
		//TODO(Mr Magma): Extensions don't load, probably some LCTV security thing. See if this can be fixed
		jQuery.getScript(url);
	};



	$(Candy).on("candy:view.message.before-show", function(evt, args) {
		/*
		args.name is the username of the message sender
		args.message is obviously the text of the message sent
		*/
		internal.processMessage(args.name, args.message);
	});

	$(Candy).on("candy:core.presence.room", function(evt, args) {
		var eventType = args.action;
		var userName = args.user.data.nick;

		if (!args.action) return;

		if (commandUtil.roster.indexOf(userName) === -1 && eventType === "join" && Bot.enableWelcome) {
			notify("New viewer!", userName + " has joined the stream!");
            if (Bot.welcome.constructor === Array) {
            	var messageIndex = Math.floor(Math.random() * Bot.welcome.length);
				internal.sendMessage(Bot.welcome[messageIndex], {target: userName});
            } else {
            	internal.sendMessage(Bot.welcome, {target: userName});
        	}
		}
		internal.updateRoster();
	});


	return Bot;
})();

Bot.setCommand("roster", function() {
	var data = arguments[arguments.length - 1];
	sendMessage("@{{TARGET}} There are " + roster.length + " people in chat right now", {target: data.sender});
}, "Gets the number of people in the chatroom currently. Usage /roster");

Bot.setCommand("who", function() {
	var data = arguments[arguments.length - 1];
	var message = "@{{TARGET}}: Users in chat are ";
	for (var i = 0; i < roster.length; i ++) {
		var userAppend = "";
		if (i === roster.length - 1) {
			userAppend += "and ";
		}
		userAppend += roster[i];
		if (i < roster.length - 1) {
			userAppend += ", ";
		}
		message += userAppend;
	}
	sendMessage(message, {target: data.sender});
}, "Gets a list of the usernames of people currently in chat. Usage /who");