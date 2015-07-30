Bot.setCommand("shrug", function() {
	var data = arguments[arguments.length - 1];
	sendMessage("@{{TARGET}} says: ¯\\_(ツ)_/¯", {target: data.sender})
}, "¯\\_(ツ)_/¯");