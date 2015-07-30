Bot.setCommand("time", function() {

	sendMessage("The time is {{TIME}} {{TIMEZONE}}", {
		time: (new Date).getUTCHours() + ":" + (new Date).getMinutes(),
		timeZone: "UTC"
	});
}, "Gets the current UTC time. Usage /time");