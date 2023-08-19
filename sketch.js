let cols = 30;
let rows = 30;
let grid = new Array(cols);

let openSet = [];
let closedSet = [];
let start;
let end;
let w, h;
let path = [];

// const gridSize = document.querySelector("#grid-size");
// console.log(gridSize.value);

const newPath = document.querySelector("#new-path");
newPath.addEventListener("click", () => {
	window.location.reload();
});

function setup() {
	frameRate(24);
	createCanvas(500, 500);
	console.log('A*');

	w = width / cols;
	h = height / rows;

	// Making a 2D grid
	for (let i = 0; i < cols; i++) {
		grid[i] = new Array(rows);
	}

	// Fill grid
	for (let i = 0; i < cols; i++) {
		for (let j = 0; j< rows; j++) {
			grid[i][j] = new Spot(i,j);
		}
	}

	// Initialize start/end
	start = grid[0][0];
	end = grid[cols - 1][rows - 1];
	openSet.push(start);

	// start.setH(end);
	start.wall = false;
	end.wall = false;

	// Add neighbors of each Spot
	for (let i = 0; i < cols; i++) {
		for (let j = 0; j< rows; j++) {
			grid[i][j].addNeighbors(grid);
		};
	};
};

function draw() {
	aStar();
};

function aStar() {
	// the A* algorithm
	if (openSet.length > 0) {
		// keep going
		console.log("Searching...");

		let winnerIndex = 0;
		for (let i = 0; i < openSet.length; i++) {
			if (openSet[i].f < openSet[winnerIndex].f) {
				winnerIndex = i;
			} else if (openSet[i].f === openSet[winnerIndex].f) {
				if (openSet[i].h < openSet[winnerIndex].h) {
					winnerIndex = i;
				};
			};
		};

		let current = openSet[winnerIndex];

		// create the path up through this point
		path = [];
		let temp = current;
		path.push(temp);
		while (temp.cameFrom) {
			path.push(temp.cameFrom);
			temp = temp.cameFrom;
		};

		// if we found the end, we done!
		if (current === end) {
			console.log("Done!");
			noLoop();
		};

		// found winning index
		openSet.splice(winnerIndex, 1);
		closedSet.push(current);

		let neighbors = current.neighbors;
		for (let i = 0; i < neighbors.length; i++) {
			let neighbor = neighbors[i];

			// if neighbor is already in closedSet, it has already been checked
			// optimization: includes => binary search through array
			if (!closedSet.includes(neighbor) && !neighbor.wall) {

				// setting tentative g as it could have a better g already
				let tentativeG = current.g + 1;
				let newPath = false;

				// has spot been evaluated before?
				// optimization: includes => binary search through array
				if (openSet.includes(neighbor)) {
					if (tentativeG < neighbor.g) {

						// spot has been evaluated before but this is a better g
						neighbor.g = tentativeG;
						newPath = true;
					};
				} else {

					// spot has not been evaluated before so we set the g and add it to openSet for further comparing
					neighbor.g = tentativeG;
					openSet.push(neighbor);
					newPath = true;
				};

				if (newPath) {
					// heuristic evaluation
					neighbor.setH(end);
					neighbor.f = neighbor.g + neighbor.h;
					neighbor.cameFrom = current;
				}
			};
		};
	} else {
		// no solution
		console.log("No Solution");
		noLoop();
		return;
	}

	// drawing the background here covers previously drawn path lines
	background(255);

	// draw Spots/squares
	for (let i = 0; i < cols; i++) {
		for (let j = 0; j < rows; j++) {
			grid[i][j].show(color(255));
		}
	}

	// visualize closedSet
	for (let i = 0; i < closedSet.length; i++) {
		closedSet[i].show(color(255,0,0));
	}

	// visualize openSet
	for (let i = 0; i < openSet.length; i++) {
		openSet[i].show(color(0,255,0));
	}

	// visualize path
	for (let i = 0; i < path.length; i++) {
		path[i].show(color(0,0,255));
	}

	// visualize path with a connected line
	noFill();
	stroke(255, 0, 250);
	strokeWeight(w * 0.33);
	beginShape();
	for (let i = 0; i < path.length; i++) {
		vertex(path[i].i * w + w / 2, path[i].j * h + h / 2);
	}
	endShape();
};

function Spot(i,j) {
	this.i = i;
	this.j = j;
	this.f = 0;
	this.g = 0;
	this.h = 0;
	this.neighbors = [];
	this.cameFrom = undefined;
	this.wall = false;

	if (random(1) < 0.33) {
		this.wall = true;
	}

	this.show = (color) => {
		fill(color);
		if (this.wall) {
			fill(0);
		}
		noStroke();
		// rect(this.i * w, this.j * h, w - 1, h - 1);
		circle(this.i * w + w / 2, this.j * h + h / 2, w * 1);
	};

	this.addNeighbors = (grid) => {
		let [i, j] = [this.i, this.j];
		if (i < cols - 1) {
			this.neighbors.push(grid[i + 1][j]);
		};
		if (i > 0) {
			this.neighbors.push(grid[i - 1][j]);
		}
		if (j < rows - 1) {
			this.neighbors.push(grid[i][j + 1]);
		}
		if (j > 0) {
			this.neighbors.push(grid[i][j - 1]);
		}
		if (i > 0 && j > 0) {
			this.neighbors.push(grid[i - 1][j - 1]);
		}
		if (i < cols - 1 && j > 0) {
			this.neighbors.push(grid[i + 1][j - 1]);
		}
		if (i > 0 && j < rows - 1) {
			this.neighbors.push(grid[i - 1][j + 1]);
		}
		if (i < cols - 1 && j < rows - 1) {
			this.neighbors.push(grid[i + 1][j + 1]);
		}
	};

	// dist is a p5 function that finds euclidean distance
	// optimization: could do a better job of comparing diagonal vs. just left/right/up/down
	// a.k.a. diagonals are sqrt(2) times longer
	this.setH = (end) => {
		let d = dist(this.i, this.j, end.i, end.j)
		// let d = abs(this.i - end.i) + abs(this.j - end.j);
		this.h = d;
	};
};

function removeFromArray(array, element) {
	for (let i = array.length - 1; i >= 0; i--) {
		if (array[i] == element) {
			array.splice(i, 1);
		}
	}
}