Bot.onMessage(function(sender, message) {
	var angusBad = ["[{{SENDER}}]: Shut up Angus", "[{{SENDER}}]: You annoy me Angus", "[{{SENDER}}]: I wonder sometimes how something with so little intelligence as Angus survived natural selection"];
	if (!message.search(/^\[Angus\]/i) && Math.random() <= 0.1) {
		var index = Math.floor(Math.random() * angusBad.length);
		Bot.sendMessage(angusBad[index]);
	}
});

Bot.enableWelcome = false;
Bot.enableNotifications = false;