Bot.setCommand("add", function(a, b) {
	var data = arguments[arguments.length - 1];
	sendMessage("{{SENDER}}: @{{TARGET}} " + a + " plus " + b + " equals " + (parseFloat(a) + parseFloat(b)), {target: data.sender});
}, "Adds two numbers. Usage /add number1 number2");

Bot.setCommand("subtract", function(a, b) {
	var data = arguments[arguments.length - 1];
	sendMessage("{{SENDER}}: @{{TARGET}} " + a + " minus " + b + " equals " + (parseFloat(a) - parseFloat(b)), {target: data.sender});
}, "Subtracts one number from another. Usage /subtract number1 number2");