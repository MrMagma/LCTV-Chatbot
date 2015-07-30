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