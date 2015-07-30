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
	if (Bot.roster(challengee)) { 
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
	if (!Bot.roster(challenger)) {
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