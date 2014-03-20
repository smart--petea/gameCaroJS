var http = require('http') ,
	fs = require('fs'),
	io = require('socket.io');

var server = new http.Server(function(req, res) {
	fs.readFile("index.html", {encoding: "utf8"}, function(err, content) {
		if(err) throw err;

		res.statusCode = 200;
		res.end(content);
	})
}).listen(3001);

io = io.listen(server);
io.sockets.on("connection", function(socket) {
	var lastInd, table;
	function start() {
		table = new Array;
		for(i = 0; i < height; i++) table.push(new Array(width));
		lastInd = 1;
	}

	start();

	socket.on('start', function(data) {
		start();
	});

	socket.on('set', function(data) {
		var x = data.x,
			y = data.y,
			ind = data.index;

		if(ind === lastInd) {
			socket.emit('error', {
				message: "something wrong on server. This player is clicking.",
			});
			return;
		}

		if(table[x][y]) {
			socket.emit('error', {
				message: "something wrong on server. This cell is not empty.",
			})
			return;
		}

		lastInd = table[x][y] = ind;
		sFiveResult = searchFive(ind, table);
		if(sFiveResult) {
			sFiveResult.index = ind;
			socket.emit("success", sFiveResult);
		} else {
			socket.emit("next");
	 	}
	});
});


/* functions */
var	height = 20,
	width = 20;

function searchFive(player, table) {
	var first = {x: 0, y:0},
		last = {x: 0, y: 0},
		count = 0,
		i, j,
		sFiveResult;
	
	//search by line
	for(row = 0; row < width; row++) {
		count = 0;	
		for(col = 0; col < height; col++) {
			if(table[row][col] == player){
				if(count == 0) {
					first.x = col;
					first.y = row;
				};
				count += 1;
				if(count >= 5){
					last.x = col;
					last.y = row;

					return {
						first: first,
						last: last,
					};
				}
			} else {
				count = 0;
			}
		}
	}	

	//search by column 
	for(col = 0; col < width; col++) {
		count = 0;	
		for(row = 0; row < height; row++) {
			if(table[row][col] == player){
				if(count == 0) {
					first.x = col;
					first.y = row;
				};
				count += 1;
				if(count >= 5){
					last.x = col;
					last.y = row;

					return {
						first: first,
						last: last,
					};
				}
			} else {
				count = 0;
			}
		}
	}	

	//search by first diagonal
	var endRow;
	for(var diag = 0; diag < width + height - 1; diag++) {
		count = 0;
		row = Math.min(diag, height - 1);
		endRow = col = diag - row;
		while(row >= endRow) {
			if(table[row][col] == player){
				if(count == 0) {
					first.x = col;
					first.y = row;
				};
				count += 1;
				if(count >= 5){
					last.x = col;
					last.y = row;

					return {
						first: first,
						last: last,
					};
				}
			} else {
				count = 0;
			}

			--row;
			++col;
		}
	}

	//search by second diagonal, only for square
	for(var diag = 1-height; diag < height; diag ++){
		if(diag < 0) {
			col = -diag;
			row = 0;
			endRow = height - 1 - col;
		} else {
			row = diag;
			col = 0;
			endRow = height - 1;
		}

		while(row <= endRow) {
			if(table[row][col] == player){
				if(count == 0) {
					first.x = col;
					first.y = row;
				};
				count += 1;
				if(count >= 5){
					last.x = col;
					last.y = row;

					return {
						first: first,
						last: last,
					};
				}
			} else {
				count = 0;
			}

			++row;
			++col;
		}
	}

	return null;
}
